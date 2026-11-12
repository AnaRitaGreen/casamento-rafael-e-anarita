import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Input,
  Table,
  Text,
  Badge,
} from '@chakra-ui/react'
import {
  getAdminGuests,
  toggleGuestCheckIn,
  type AdminGuest,
} from '@/services/adminService'
import { useNavigate } from 'react-router-dom'

const SelectBox = Box as any

export function CheckIn() {
  const [allGuests, setAllGuests] = useState<AdminGuest[]>([])
  const [filteredGuests, setFilteredGuests] = useState<AdminGuest[]>([])
  const [guestSearch, setGuestSearch] = useState('')
  const [guestFilterStatus, setGuestFilterStatus] = useState('')
  const [guestFilterCheckIn, setGuestFilterCheckIn] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const PER_PAGE = 15

  const navigate = useNavigate()

  useEffect(() => {
    loadGuests()
  }, [])

  const loadGuests = async () => {
    try {
      const data = await getAdminGuests()
      setAllGuests(data)
    } catch (err: any) {
      if (err?.response?.status === 401) navigate('/login')
    }
  }

  useEffect(() => {
    const search = guestSearch.toLowerCase().trim()
    const filtered = allGuests.filter((g) => {
      const tableStr = g.table_number ? `mesa ${g.table_number}` : ''
      const matchName =
        g.name.toLowerCase().includes(search) ||
        (g.group_name ?? '').toLowerCase().includes(search) ||
        tableStr.includes(search)
      const matchStatus =
        guestFilterStatus === '' ? true : g.rsvp_status === guestFilterStatus
      const matchCheckIn =
        guestFilterCheckIn === ''
          ? true
          : guestFilterCheckIn === 'checked_in'
            ? Boolean(g.checked_in)
            : !g.checked_in
      return matchName && matchStatus && matchCheckIn
    })
    setFilteredGuests(filtered)
    setCurrentPage(1)
  }, [
    guestSearch,
    guestFilterStatus,
    guestFilterCheckIn,
    allGuests,
  ])

  const handleToggleCheckIn = async (guest: AdminGuest) => {
    const nextValue = !guest.checked_in
    const nowIso = nextValue ? new Date().toISOString() : null

    // Atualização otimista para resposta imediata na recepção
    setAllGuests((prev) =>
      prev.map((item) =>
        item.id === guest.id
          ? { ...item, checked_in: nextValue, checked_in_at: nowIso }
          : item,
      ),
    )

    try {
      await toggleGuestCheckIn(guest.id, nextValue)
    } catch {
      alert('Erro ao atualizar presença do convidado.')
      loadGuests()
    }
  }

  const startIdx = (currentPage - 1) * PER_PAGE
  const pageGuests = filteredGuests.slice(startIdx, startIdx + PER_PAGE)
  const totalPages = Math.ceil(filteredGuests.length / PER_PAGE)

  const checkedInGuests = allGuests.filter((g) => g.checked_in)
  const totalCheckedIn = checkedInGuests.length
  const checkedInInteira = checkedInGuests.filter(
    (g) => (g.buffet_status || 'inteira') === 'inteira',
  ).length
  const checkedInMeia = checkedInGuests.filter(
    (g) => g.buffet_status === 'meia',
  ).length
  const checkedInIsento = checkedInGuests.filter(
    (g) => g.buffet_status === 'isento',
  ).length
  const totalConfirmed = allGuests.filter((g) => g.rsvp_status === 'attending').length
  const remainingConfirmed = allGuests.filter(
    (g) => g.rsvp_status === 'attending' && !g.checked_in,
  ).length

  const statusBadge = (status: string) => {
    switch (status) {
      case 'attending':
        return (
          <Badge colorPalette="green" variant="subtle">
            ✅ Confirmado
          </Badge>
        )
      case 'declined':
        return (
          <Badge colorPalette="red" variant="subtle">
            ❌ Não vai
          </Badge>
        )
      case 'pending':
        return (
          <Badge colorPalette="yellow" variant="subtle">
            ⏳ Pendente
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Box>
      <Flex
        justify="space-between"
        align="flex-start"
        flexWrap="wrap"
        gap="4"
        mb="6"
      >
        <Box>
          <Heading as="h1" size="3xl" color="purple.600" mb="1">
            Recepção / Check-in
          </Heading>
          <Text color="gray.500">
            Confirme a presença dos convidados na data do evento e consulte suas mesas
          </Text>
        </Box>
      </Flex>

      {/* Resumo rápido */}
      <Grid
        templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)' }}
        gap="4"
        mb="6"
      >
        <Box bg="green.500" color="white" borderRadius="2xl" p="5">
          <Text fontSize="2xl" fontWeight="800">
            {totalCheckedIn}
          </Text>
          <Text fontSize="sm" opacity={0.9}>
            Presentes no Evento ✅
          </Text>
          <Flex
            gap="3"
            mt="2"
            fontSize="xs"
            fontWeight="600"
            opacity={0.95}
            flexWrap="wrap"
          >
            <Text>🍽️ Inteira: {checkedInInteira}</Text>
            <Text>🧒 Meia: {checkedInMeia}</Text>
            <Text>👶 Isento: {checkedInIsento}</Text>
          </Flex>
        </Box>
        <Box bg="purple.500" color="white" borderRadius="2xl" p="5">
          <Text fontSize="2xl" fontWeight="800">
            {totalConfirmed}
          </Text>
          <Text fontSize="sm" opacity={0.9}>
            Confirmados (RSVP)
          </Text>
          <Flex
            gap="3"
            mt="2"
            fontSize="xs"
            fontWeight="600"
            opacity={0.95}
            flexWrap="wrap"
          >
            <Text>⏳ Aguardando chegada: {remainingConfirmed}</Text>
          </Flex>
        </Box>
      </Grid>

      {/* Busca e Filtros (responsivos para celular) */}
      <Flex gap="2.5" mb="5" flexWrap="wrap">
        <Input
          placeholder="Buscar por nome, grupo ou mesa..."
          flex={{ base: '1 1 100%', md: '1' }}
          minW="0"
          borderRadius="xl"
          borderColor="purple.200"
          value={guestSearch}
          onChange={(e) => setGuestSearch(e.target.value)}
        />
        <SelectBox
          as="select"
          px="3"
          py="2"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="purple.200"
          display={{ base: 'none', md: 'block' }}
          bg="white"
          flex={{ base: '1 1 100%', md: '0 0 auto' }}
          minW="0"
          fontSize="sm"
          value={guestFilterCheckIn}
          onChange={(e: any) => setGuestFilterCheckIn(e.target.value)}
        >
          <option value="">Todos (Evento)</option>
          <option value="checked_in">🟢 Já chegaram</option>
          <option value="not_checked_in">⚪ Ainda não chegaram</option>
        </SelectBox>
        <SelectBox
          as="select"
          px="3"
          py="2"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="purple.200"
          bg="white"
          display={{ base: 'none', md: 'block' }}
          minW="0"
          fontSize="sm"
          value={guestFilterStatus}
          onChange={(e: any) => setGuestFilterStatus(e.target.value)}
        >
          <option value="">Status RSVP</option>
          <option value="attending">✅ Confirmados</option>
          <option value="declined">❌ Não vão</option>
          <option value="pending">⏳ Pendentes</option>
        </SelectBox>
      </Flex>

      {/* Tabela de Convidados com Mesa e Checkbox de Presença */}
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
                <Table.ColumnHeader
                  fontWeight="700"
                  textTransform="uppercase"
                  fontSize="xs"
                  letterSpacing="wider"
                  color="purple.700"
                  px={{ base: '3', md: '5' }}
                  py="3"
                  textAlign="center"
                  w="60px"
                >
                  Check
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  fontWeight="700"
                  textTransform="uppercase"
                  fontSize="xs"
                  letterSpacing="wider"
                  color="purple.700"
                  px={{ base: '2', md: '5' }}
                  py="3"
                >
                  Convidado / Grupo
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  fontWeight="700"
                  textTransform="uppercase"
                  fontSize="xs"
                  letterSpacing="wider"
                  color="purple.700"
                  px={{ base: '3', md: '5' }}
                  py="3"
                  textAlign={{ base: 'right', md: 'left' }}
                >
                  Mesa
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  fontWeight="700"
                  textTransform="uppercase"
                  fontSize="xs"
                  letterSpacing="wider"
                  color="purple.700"
                  px="5"
                  py="3"
                  display={{ base: 'none', md: 'table-cell' }}
                >
                  Status RSVP
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  fontWeight="700"
                  textTransform="uppercase"
                  fontSize="xs"
                  letterSpacing="wider"
                  color="purple.700"
                  px="5"
                  py="3"
                  display={{ base: 'none', md: 'table-cell' }}
                >
                  Entrada em
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {pageGuests.length === 0 ? (
                <Table.Row>
                  <Table.Cell
                    colSpan={5}
                    textAlign="center"
                    py="8"
                    color="gray.400"
                  >
                    Nenhum convidado encontrado.
                  </Table.Cell>
                </Table.Row>
              ) : (
                pageGuests.map((g) => (
                  <Table.Row
                    key={g.id}
                    transition="background 0.15s"
                    bg={g.checked_in ? 'green.50/40' : undefined}
                  >
                    <Table.Cell
                      px={{ base: '3', md: '5' }}
                      py="3"
                      textAlign="center"
                      verticalAlign="middle"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(g.checked_in)}
                        onChange={() => handleToggleCheckIn(g)}
                        style={{
                          width: '1.35rem',
                          height: '1.35rem',
                          cursor: 'pointer',
                          accentColor: '#16a34a',
                        }}
                        title={
                          g.checked_in
                            ? 'Desmarcar presença no evento'
                            : 'Confirmar presença no evento'
                        }
                      />
                    </Table.Cell>
                    <Table.Cell
                      px={{ base: '2', md: '5' }}
                      py="3"
                      fontSize="sm"
                      verticalAlign="middle"
                    >
                      <Flex align="center" gap="1.5" flexWrap="wrap">
                        <Text fontWeight="600" lineHeight="short">
                          {g.name}
                        </Text>
                        {g.is_child && (
                          <Badge
                            size="xs"
                            colorPalette="purple"
                            variant="subtle"
                          >
                            criança
                          </Badge>
                        )}
                      </Flex>
                      <Text fontSize="xs" color="gray.500" mt="0.5">
                        {g.group_name || 'Sem grupo'}
                      </Text>
                    </Table.Cell>
                    <Table.Cell
                      px={{ base: '3', md: '5' }}
                      py="3"
                      textAlign={{ base: 'right', md: 'left' }}
                      verticalAlign="middle"
                      whiteSpace="nowrap"
                    >
                      {g.table_number ? (
                        <Badge
                          colorPalette="purple"
                          variant="solid"
                          fontSize="xs"
                          px="2.5"
                          py="1"
                          borderRadius="full"
                        >
                          🪑 Mesa {g.table_number}
                        </Badge>
                      ) : (
                        <Badge colorPalette="gray" variant="subtle" fontSize="xs">
                          Sem mesa
                        </Badge>
                      )}
                    </Table.Cell>
                    <Table.Cell
                      px="5"
                      py="3"
                      display={{ base: 'none', md: 'table-cell' }}
                      verticalAlign="middle"
                    >
                      {statusBadge(g.rsvp_status)}
                    </Table.Cell>
                    <Table.Cell
                      px="5"
                      py="3"
                      fontSize="xs"
                      color="gray.500"
                      display={{ base: 'none', md: 'table-cell' }}
                      verticalAlign="middle"
                    >
                      {g.checked_in_at
                        ? new Date(g.checked_in_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
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
          flexWrap="wrap"
          gap="2"
        >
          <Text fontSize="sm" color="gray.500">
            Exibindo {Math.min(startIdx + 1, filteredGuests.length)}–
            {Math.min(startIdx + PER_PAGE, filteredGuests.length)} de{' '}
            {filteredGuests.length} convidados
          </Text>
          <Flex gap="2" flexWrap="wrap">
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
    </Box>
  )
}
