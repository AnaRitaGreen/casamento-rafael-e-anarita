import { useEffect, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Spinner,
  Table,
  Text,
} from '@chakra-ui/react'
import {
  getAdminPresentes,
  deletePresente as deletePresenteApi,
  liberarReservaPresente,
  type AdminPresente,
} from '@/services/adminService'
import { PresenteModal } from '@/components/modal/PresenteModal'
import { useNavigate } from 'react-router-dom'

const ABox = Box as any;

export function Gifts() {
  const [presentes, setPresentes] = useState<AdminPresente[]>([])
  const [presentesMetrics, setPresentesMetrics] = useState({ total: 0, reservados: 0, disponiveis: 0 })
  const [presentesLoading, setPresentesLoading] = useState(false)

  const [isPresenteModalOpen, setIsPresenteModalOpen] = useState(false)
  const [editingPresenteId, setEditingPresenteId] = useState<string | null>(null)
  const [initialPresenteData, setInitialPresenteData] = useState<any>(undefined)

  const navigate = useNavigate()

  useEffect(() => {
    loadPresentes()
  }, [])

  const loadPresentes = async () => {
    setPresentesLoading(true)
    try {
      const data = await getAdminPresentes()
      setPresentes(data)
      const reservados = data.filter((p) => p.reserved).length
      setPresentesMetrics({ total: data.length, reservados, disponiveis: data.length - reservados })
    } catch (err: any) {
      if (err?.response?.status === 401) navigate('/login')
    } finally {
      setPresentesLoading(false)
    }
  }

  const deletePresente = async (id: string, title: string) => {
    if (!window.confirm(`Remover "${title}" da lista?`)) return
    try {
      await deletePresenteApi(id)
      loadPresentes()
    } catch {
      alert('Erro ao remover presente.')
    }
  }

  const liberarReserva = async (id: string) => {
    if (!window.confirm('Liberar a reserva desse presente? Ele voltará a ficar disponível.')) return
    try {
      await liberarReservaPresente(id)
      loadPresentes()
    } catch {
      alert('Erro ao liberar reserva.')
    }
  }

  const openAddPresenteModal = () => {
    setEditingPresenteId(null)
    setInitialPresenteData(undefined)
    setIsPresenteModalOpen(true)
  }

  const editPresente = (id: string) => {
    const p = presentes.find((x) => x.id === id)
    if (!p) return
    setEditingPresenteId(id)
    setInitialPresenteData({
      title: p.title,
      description: p.description || '',
      value: p.value,
      image: p.image || '',
      link: p.link || '',
    })
    setIsPresenteModalOpen(true)
  }

  return (
    <Box>
      <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap="4" mb="6">
        <Box>
          <Heading as="h1" size="3xl" color="purple.600" mb="1">
            Presentes
          </Heading>
          <Text color="gray.500">Gerencie a lista de casamento</Text>
        </Box>
        <Button colorPalette="purple" borderRadius="full" onClick={openAddPresenteModal}>
          + Adicionar Presente
        </Button>
      </Flex>

      {/* Metrics */}
      <Grid templateColumns={{ base: '1fr', sm: 'repeat(3, 1fr)' }} gap="4" mb="6">
        <Box bg="purple.500" color="white" borderRadius="2xl" p="5">
          <Text fontSize="2xl" fontWeight="800">{presentesMetrics.total}</Text>
          <Text fontSize="sm" opacity={0.9}>Total</Text>
        </Box>
        <Box bg="green.500" color="white" borderRadius="2xl" p="5">
          <Text fontSize="2xl" fontWeight="800">{presentesMetrics.reservados}</Text>
          <Text fontSize="sm" opacity={0.9}>Reservados ✅</Text>
        </Box>
        <Box bg="yellow.500" color="white" borderRadius="2xl" p="5">
          <Text fontSize="2xl" fontWeight="800">{presentesMetrics.disponiveis}</Text>
          <Text fontSize="sm" opacity={0.9}>Disponíveis</Text>
        </Box>
      </Grid>

      {/* Table */}
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
                <Table.ColumnHeader fontWeight="700" textTransform="uppercase" fontSize="xs" letterSpacing="wider" color="purple.700" px="5" py="3">Presente</Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="700" textTransform="uppercase" fontSize="xs" letterSpacing="wider" color="purple.700" px="5" py="3">Preço</Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="700" textTransform="uppercase" fontSize="xs" letterSpacing="wider" color="purple.700" px="5" py="3">Link</Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="700" textTransform="uppercase" fontSize="xs" letterSpacing="wider" color="purple.700" px="5" py="3">Status</Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="700" textTransform="uppercase" fontSize="xs" letterSpacing="wider" color="purple.700" px="5" py="3">Quem Reservou</Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="700" textTransform="uppercase" fontSize="xs" letterSpacing="wider" color="purple.700" px="5" py="3" textAlign="center">Ações</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {presentesLoading && (
                <Table.Row>
                  <Table.Cell colSpan={6} textAlign="center" py="8">
                    <Flex justify="center" align="center" gap="3">
                      <Spinner size="sm" color="purple.500" />
                      <Text color="gray.500">Carregando...</Text>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              )}
              {!presentesLoading && presentes.length === 0 && (
                <Table.Row>
                  <Table.Cell colSpan={6} textAlign="center" py="8" color="gray.400">
                    Nenhum presente cadastrado ainda.
                  </Table.Cell>
                </Table.Row>
              )}
              {presentes.map((p) => (
                <Table.Row key={p.id} transition="background 0.15s">
                  <Table.Cell px="5" py="3" fontSize="sm">
                    <Text fontWeight="600">{p.title}</Text>
                    <Text fontSize="xs" color="gray.500">{p.description}</Text>
                  </Table.Cell>
                  <Table.Cell px="5" py="3" fontSize="sm" fontWeight="700" color="purple.700">
                    {Number(p.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </Table.Cell>
                  <Table.Cell px="5" py="3">
                    <ABox
                      as="a"
                      href={p.link || ''}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="purple.600"
                      fontSize="xs"
                      _hover={{ textDecoration: 'underline' }}
                    >
                      🔗 /link
                    </ABox>
                  </Table.Cell>
                  <Table.Cell px="5" py="3">
                    {p.reserved ? (
                      <Badge colorPalette="green" variant="subtle">✅ Reservado</Badge>
                    ) : (
                      <Badge colorPalette="yellow" variant="subtle">⬜ Disponível</Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell px="5" py="3" fontSize="sm" color="gray.500">
                    {p.reserved_by || '—'}
                  </Table.Cell>
                  <Table.Cell px="5" py="3" textAlign="center">
                    <Flex gap="1" justify="center">
                      <Button size="xs" variant="ghost" onClick={() => editPresente(p.id)} title="Editar">
                        ✏️
                      </Button>
                      {p.reserved && (
                        <Button size="xs" variant="ghost" onClick={() => liberarReserva(p.id)} title="Liberar reserva">
                          🔓
                        </Button>
                      )}
                      <Button size="xs" variant="ghost" onClick={() => deletePresente(p.id, p.title)} title="Remover">
                        🗑️
                      </Button>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Box>

      <PresenteModal
        isOpen={isPresenteModalOpen}
        onClose={() => setIsPresenteModalOpen(false)}
        onSave={() => {
          setIsPresenteModalOpen(false)
          loadPresentes()
        }}
        editingPresenteId={editingPresenteId}
        initialData={initialPresenteData}
      />
    </Box>
  )
}
