import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Table,
  Text,
  Badge,
} from '@chakra-ui/react'
import {
  getAdminGroups,
  updateGroup,
  deleteGroup as deleteGroupApi,
  type AdminGroup,
} from '@/services/adminService'
import { useNavigate } from 'react-router-dom'
import { GroupModal } from '@/components/modal/GroupModal'

export function Groups() {
  const [groups, setGroups] = useState<AdminGroup[]>([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminGroup | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    try {
      const data = await getAdminGroups()
      setGroups(data)
    } catch (err: any) {
      if (err?.response?.status === 401) navigate('/login')
    }
  }

  const handleDelete = async (group: AdminGroup) => {
    if (!window.confirm(`Remover o grupo "${group.name}"?\n\nSó é possível remover grupos sem convidados.`))
      return
    try {
      await deleteGroupApi(group.id)
      loadGroups()
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Erro ao remover grupo.'
      alert(msg)
    }
  }

  const handleToggleInvite = async (group: AdminGroup) => {
    try {
      await updateGroup(group.id, { name: group.name, invite_sent: !group.invite_sent })
      loadGroups()
    } catch {
      alert('Erro ao atualizar status do convite.')
    }
  }

  const openEdit = (group: AdminGroup) => {
    setEditing(group)
    setIsModalOpen(true)
  }

  const openNew = () => {
    setEditing(null)
    setIsModalOpen(true)
  }

  const filtered = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.slug.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <Box>
      <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap="4" mb="6">
        <Box>
          <Heading as="h1" size="3xl" color="purple.600" mb="1">
            Grupos
          </Heading>
          <Text color="gray.500">Gerencie os grupos familiares de convidados</Text>
        </Box>
        <Button colorPalette="purple" borderRadius="full" onClick={openNew}>
          + Novo Grupo
        </Button>
      </Flex>

      <Box mb="5">
        <Input
          placeholder="Buscar por nome ou slug..."
          borderRadius="xl"
          borderColor="purple.200"
          maxW="360px"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      <Box
        bg="bg.panel"
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="border"
        overflow="hidden"
        boxShadow="sm"
      >
        <Box overflowX="auto">
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader fontWeight="700" textTransform="uppercase" fontSize="xs" letterSpacing="wider" color="purple.700" px="5" py="3">Nome</Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="700" textTransform="uppercase" fontSize="xs" letterSpacing="wider" color="purple.700" px="5" py="3">Slug (URL)</Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="700" textTransform="uppercase" fontSize="xs" letterSpacing="wider" color="purple.700" px="5" py="3">Link do Convite</Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="700" textTransform="uppercase" fontSize="xs" letterSpacing="wider" color="purple.700" px="5" py="3" textAlign="center">Enviado?</Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="700" textTransform="uppercase" fontSize="xs" letterSpacing="wider" color="purple.700" px="5" py="3">Convidados</Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="700" textTransform="uppercase" fontSize="xs" letterSpacing="wider" color="purple.700" px="5" py="3">Ações</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filtered.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={6} textAlign="center" py="8" color="gray.400">
                    Nenhum grupo encontrado.
                  </Table.Cell>
                </Table.Row>
              ) : (
                filtered.map((g) => (
                  <Table.Row key={g.id} transition="background 0.15s">
                    <Table.Cell px="5" py="3" fontSize="sm" fontWeight="600">
                      {g.name}
                    </Table.Cell>
                    <Table.Cell px="5" py="3">
                      <Badge variant="outline" colorPalette="purple" fontSize="xs">
                        {g.slug}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell px="5" py="3">
                      <Box
                        as="a"
                        href={`https://convite-casamento.digital/${g.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="purple.600"
                        fontSize="xs"
                        _hover={{ textDecoration: 'underline' }}
                      >
                        🔗 /{g.slug}
                      </Box>
                    </Table.Cell>
                    <Table.Cell px="5" py="3" textAlign="center">
                      <input
                        type="checkbox"
                        checked={g.invite_sent || false}
                        onChange={() => handleToggleInvite(g)}
                        style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer', accentColor: '#7c3aed' }}
                        title={g.invite_sent ? 'Convite já enviado' : 'Marcar como enviado'}
                      />
                    </Table.Cell>
                    <Table.Cell px="5" py="3">
                      <Flex gap="1" fontSize="sm">
                        <Text color="purple.700" fontWeight="500" title="Total">
                          {g.total_guests || 0}
                        </Text>
                        <Text>/</Text>
                        <Text color="green.600" fontWeight="500" title="Confirmados">
                          {g.attending_guests || 0}
                        </Text>
                        <Text>/</Text>
                        <Text color="red.500" fontWeight="500" title="Recusados">
                          {g.declined_guests || 0}
                        </Text>
                      </Flex>
                    </Table.Cell>
                    <Table.Cell px="5" py="3">
                      <Flex gap="1">
                        <Button size="xs" variant="ghost" onClick={() => openEdit(g)} title="Editar">
                          ✏️
                        </Button>
                        <Button size="xs" variant="ghost" onClick={() => handleDelete(g)} title="Remover">
                          🗑️
                        </Button>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table.Root>
        </Box>
        <Flex px="5" py="3" borderTopWidth="1px" borderColor="border">
          <Text fontSize="sm" color="gray.500">
            {filtered.length} grupo{filtered.length !== 1 ? 's' : ''}
          </Text>
        </Flex>
      </Box>

      <GroupModal
        isOpen={isModalOpen}
        editing={editing}
        onClose={() => setIsModalOpen(false)}
        onSave={() => {
          setIsModalOpen(false)
          loadGroups()
        }}
      />
    </Box>
  )
}
