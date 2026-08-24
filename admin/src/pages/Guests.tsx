import { useEffect, useState } from 'react'
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
import { getAdminGuests, deleteGuest as deleteGuestApi, type AdminGuest } from '@/services/adminService'
import { GuestModal } from '@/components/modal/GuestModal'
import { useNavigate } from 'react-router-dom'

const SelectBox = Box as any;

export function Guests() {
  const [allGuests, setAllGuests] = useState<AdminGuest[]>([])
  const [filteredGuests, setFilteredGuests] = useState<AdminGuest[]>([])
  const [guestSearch, setGuestSearch] = useState('')
  const [guestFilterStatus, setGuestFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const PER_PAGE = 15

  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false)
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null)
  const [initialGuestData, setInitialGuestData] = useState<any>(undefined)

  const navigate = useNavigate()

  useEffect(() => {
    loadGuests()
  }, [])

  const loadGuests = async () => {
    try {
      const data = await getAdminGuests()
      setAllGuests(data)
      setFilteredGuests(data)
    } catch (err: any) {
      if (err?.response?.status === 401) navigate('/login')
    }
  }

  useEffect(() => {
    const search = guestSearch.toLowerCase()
    const filtered = allGuests.filter((g) => {
      const matchName =
        g.name.toLowerCase().includes(search) ||
        (g.group_name ?? '').toLowerCase().includes(search)
      const matchStatus = guestFilterStatus === '' ? true : g.rsvp_status === guestFilterStatus
      return matchName && matchStatus
    })
    setFilteredGuests(filtered)
    setCurrentPage(1)
  }, [guestSearch, guestFilterStatus, allGuests])

  const deleteGuest = async (id: string, name: string) => {
    if (!window.confirm(`Remover "${name}" da lista?`)) return
    try {
      await deleteGuestApi(id)
      loadGuests()
    } catch {
      alert('Erro ao remover convidado.')
    }
  }

  const openAddGuestModal = () => {
    setEditingGuestId(null)
    setInitialGuestData(undefined)
    setIsGuestModalOpen(true)
  }

  const editGuest = (id: string) => {
    const g = allGuests.find((x) => x.id === id)
    if (!g) return
    setEditingGuestId(id)
    setInitialGuestData({
      name: g.name,
      group_id: g.group_id ?? '',
      group_name: '',
      is_child: g.is_child,
    })
    setIsGuestModalOpen(true)
  }

  const startIdx = (currentPage - 1) * PER_PAGE
  const pageGuests = filteredGuests.slice(startIdx, startIdx + PER_PAGE)
  const totalPages = Math.ceil(filteredGuests.length / PER_PAGE)

  const statusBadge = (status: string) => {
    switch (status) {
      case 'attending':
        return <Badge colorPalette="green" variant="subtle">✅ Confirmado</Badge>
      case 'declined':
        return <Badge colorPalette="red" variant="subtle">❌ Não vai</Badge>
      case 'pending':
        return <Badge colorPalette="yellow" variant="subtle">⏳ Pendente</Badge>
      default:
        return null
    }
  }

  return (
    <Box>
      <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap="4" mb="6">
        <Box>
          <Heading as="h1" size="3xl" color="purple.600" mb="1">
            Convidados
          </Heading>
          <Text color="gray.500">Gerencie sua lista de convidados</Text>
        </Box>
        <Button colorPalette="purple" borderRadius="full" onClick={openAddGuestModal}>
          + Adicionar Convidado
        </Button>
      </Flex>

      <Flex gap="3" mb="5" flexWrap="wrap">
        <Input
          placeholder="Buscar por nome ou grupo..."
          flex="1"
          minW="200px"
          borderRadius="xl"
          borderColor="purple.200"
          value={guestSearch}
          onChange={(e) => setGuestSearch(e.target.value)}
        />
        <SelectBox
          as="select"
          px="4"
          py="2"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="purple.200"
          bg="white"
          minW="160px"
          fontSize="sm"
          value={guestFilterStatus}
          onChange={(e: any) => setGuestFilterStatus(e.target.value)}
        >
          <option value="">Todos os status</option>
          <option value="attending">✅ Confirmados</option>
          <option value="declined">❌ Não vão</option>
          <option value="pending">⏳ Pendentes</option>
        </SelectBox>
      </Flex>

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
                <Table.ColumnHeader fontWeight="700" textTransform="uppercase" fontSize="xs" letterSpacing="wider" color="purple.700" px="5" py="3">Grupo</Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="700" textTransform="uppercase" fontSize="xs" letterSpacing="wider" color="purple.700" px="5" py="3">Status</Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="700" textTransform="uppercase" fontSize="xs" letterSpacing="wider" color="purple.700" px="5" py="3">Respondido em</Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="700" textTransform="uppercase" fontSize="xs" letterSpacing="wider" color="purple.700" px="5" py="3">Ações</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {pageGuests.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={5} textAlign="center" py="8" color="gray.400">
                    Nenhum convidado encontrado.
                  </Table.Cell>
                </Table.Row>
              ) : (
                pageGuests.map((g) => (
                  <Table.Row key={g.id} transition="background 0.15s">
                    <Table.Cell px="5" py="3" fontSize="sm">
                      <Text fontWeight="600">{g.name}</Text>
                      {g.is_child && (
                        <Badge ml="2" size="sm" colorPalette="purple" variant="subtle">
                          criança
                        </Badge>
                      )}
                    </Table.Cell>
                    <Table.Cell px="5" py="3" fontSize="sm" color="gray.600">
                      {g.group_name || '—'}
                    </Table.Cell>
                    <Table.Cell px="5" py="3">
                      {statusBadge(g.rsvp_status)}
                    </Table.Cell>
                    <Table.Cell px="5" py="3" fontSize="xs" color="gray.500">
                      {g.rsvp_responded_at
                        ? new Date(g.rsvp_responded_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                        : '—'}
                    </Table.Cell>
                    <Table.Cell px="5" py="3">
                      <Flex gap="1">
                        <Button size="xs" variant="ghost" onClick={() => editGuest(g.id)} title="Editar">
                          ✏️
                        </Button>
                        <Button size="xs" variant="ghost" onClick={() => deleteGuest(g.id, g.name)} title="Remover">
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

        <Flex
          justify="space-between"
          align="center"
          px="5"
          py="3"
          borderTopWidth="1px"
          borderColor="border"
        >
          <Text fontSize="sm" color="gray.500">
            Exibindo {Math.min(startIdx + 1, filteredGuests.length)}–
            {Math.min(startIdx + PER_PAGE, filteredGuests.length)} de {filteredGuests.length} convidados
          </Text>
          <Flex gap="2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i}
                size="xs"
                variant={i + 1 === currentPage ? 'solid' : 'outline'}
                colorPalette="purple"
                borderRadius="lg"
                onClick={() => setCurrentPage(i + 1)}
                minW="8"
              >
                {i + 1}
              </Button>
            ))}
          </Flex>
        </Flex>
      </Box>

      <GuestModal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        onSave={() => {
          setIsGuestModalOpen(false)
          loadGuests()
        }}
        editingGuestId={editingGuestId}
        initialData={initialGuestData}
      />
    </Box>
  )
}