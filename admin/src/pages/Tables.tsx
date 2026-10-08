import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Spinner,
  Grid,
  Badge,
  Input,
} from '@chakra-ui/react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import {
  getAdminTables,
  generateTables,
  updateTableCapacity,
  deleteTable,
  assignGuestToTable,
  swapTables,
  type AdminTable,
  type AdminGuest,
} from '@/services/adminService'
import { useNavigate } from 'react-router-dom'
import { useTheme } from 'next-themes'

// ── Components ──────────────────────────────────────────────────────────── //

function SortableGuestItem({ guest }: { guest: AdminGuest }) {
  const { theme } = useTheme()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: guest.id, data: { type: 'Guest', guest } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      p="3"
      mb="2"
      bg={theme === "light" ? "white" : "gray.800"}
      borderWidth="1px"
      borderColor={theme === "light" ? "gray.200" : "gray.600"}
      borderRadius="md"
      boxShadow="sm"
      cursor="grab"
      _active={{ cursor: 'grabbing', boxShadow: 'md' }}
    >
      <Text fontSize="sm" fontWeight="600">{guest.name}</Text>
      <Text fontSize="xs" color="gray.500">{guest.group_name}</Text>
    </Box>
  )
}

function TableColumn({
  table,
  guests,
  onDelete,
  onUpdateCapacity,
  swapSourceTableId,
  onStartSwap,
  onCancelSwap,
  onCompleteSwap,
}: {
  table: AdminTable
  guests: AdminGuest[]
  onDelete: (id: string) => void
  onUpdateCapacity: (id: string, cap: number) => void
  swapSourceTableId: string | null
  onStartSwap: (id: string) => void
  onCancelSwap: () => void
  onCompleteSwap: (id: string) => void
}) {
  const isFull = guests.length >= table.capacity

  const { setNodeRef } = useSortable({
    id: `table-${table.id}`,
    data: { type: 'Table', tableId: table.id },
  })

  const isSwapSource = swapSourceTableId === table.id
  const isSwapping = swapSourceTableId !== null

  const { theme } = useTheme()

  let cardBgColor = undefined
  let cardBorderColor = undefined

  switch (theme) {
    case "light":
      cardBgColor = isFull ? 'red.50' : 'purple.50'
      cardBorderColor = isFull ? 'red.200' : 'purple.200'
      break
    case "dark":
      cardBgColor = isFull ? 'red.900' : '#2f055369'
      cardBorderColor = isFull ? 'red.600' : 'purple.600'
      break
  }

  return (
    <Box
      bg="bg.panel"
      p="4"
      borderRadius="xl"
      borderWidth='1px'
      borderColor={isSwapSource ? 'purple.500' : cardBorderColor}
      boxShadow="sm"
      display="flex"
      flexDirection="column"
    >
      <Flex justify="space-between" align="center" mb="3">
        <Heading size="md" color={theme === "light" ? "purple.700" : "purple.400"}>Mesa {table.table_number}</Heading>
        <Badge colorPalette={isFull ? 'red' : 'purple'} variant="subtle">
          {guests.length} / {table.capacity}
        </Badge>
      </Flex>
      <Flex justify="space-between" mb="3" wrap="wrap" gap="2">
        <Flex gap="2">
          <Button size="xs" variant="ghost" onClick={() => {
            const cap = prompt('Nova capacidade:', String(table.capacity))
            if (cap && !isNaN(Number(cap))) onUpdateCapacity(table.id, Number(cap))
          }}>
            ✏️ Cap.
          </Button>
          {!isSwapping && (
            <Button size="xs" variant="ghost" colorPalette="blue" onClick={() => onStartSwap(table.id)}>
              🔄 Trocar
            </Button>
          )}
          {isSwapping && isSwapSource && (
            <Button size="xs" variant="solid" colorPalette="red" onClick={onCancelSwap}>
              ❌ Cancelar Troca
            </Button>
          )}
          {isSwapping && !isSwapSource && (
            <Button size="xs" variant="solid" colorPalette="blue" onClick={() => onCompleteSwap(table.id)}>
              ✅ Escolher
            </Button>
          )}

        </Flex>

        <Button size="xs" variant="ghost" colorPalette="red" onClick={() => onDelete(table.id)}>
          🗑️
        </Button>
      </Flex>

      <Box
        ref={setNodeRef}
        flex="1"
        bg={cardBgColor}
        borderRadius="md"
        p="2"
        minH="150px"
      >
        <SortableContext items={guests.map((g) => g.id)} strategy={verticalListSortingStrategy}>
          {guests.map((g) => (
            <SortableGuestItem key={g.id} guest={g} />
          ))}
        </SortableContext>
      </Box>
    </Box>
  )
}

function UnseatedContainer({ unseatedGuests }: { unseatedGuests: AdminGuest[] }) {
  const { setNodeRef } = useSortable({
    id: 'unseated',
    data: { type: 'Unseated' },
  })

  return (
    <Box ref={setNodeRef} minH="400px" pb="20">
      <SortableContext
        id="unseated"
        items={unseatedGuests.map(g => g.id)}
        strategy={verticalListSortingStrategy}
      >
        {unseatedGuests.map(g => (
          <SortableGuestItem key={g.id} guest={g} />
        ))}
      </SortableContext>
    </Box>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────── //

export function Tables() {
  const navigate = useNavigate()
  const [tables, setTables] = useState<AdminTable[]>([])
  const [unseatedGuests, setUnseatedGuests] = useState<AdminGuest[]>([])
  const [loading, setLoading] = useState(false)

  // Drag state
  const [activeGuest, setActiveGuest] = useState<AdminGuest | null>(null)

  // Settings state
  const [showSettings, setShowSettings] = useState(false)
  const [genCount, setGenCount] = useState('10')
  const [genCap, setGenCap] = useState('8')

  // Swap state
  const [swapSourceTableId, setSwapSourceTableId] = useState<string | null>(null)

  const { theme } = useTheme()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getAdminTables()
      setTables(data.tables)
      setUnseatedGuests(data.unseated_guests)
    } catch (err: any) {
      if (err?.response?.status === 401) navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    const c = parseInt(genCount)
    const cap = parseInt(genCap)
    if (isNaN(c) || isNaN(cap) || c <= 0 || cap <= 0) return
    try {
      setLoading(true)
      await generateTables(c, cap)
      setShowSettings(false)
      await loadData()
    } catch {
      alert('Erro ao gerar mesas')
      setLoading(false)
    }
  }

  const handleUpdateCapacity = async (id: string, cap: number) => {
    try {
      await updateTableCapacity(id, cap)
      await loadData()
    } catch {
      alert('Erro ao atualizar capacidade')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deletar esta mesa? Os convidados ficarão sem mesa.')) return
    try {
      await deleteTable(id)
      await loadData()
    } catch {
      alert('Erro ao deletar mesa')
    }
  }

  const handleStartSwap = (id: string) => {
    setSwapSourceTableId(id)
  }

  const handleCancelSwap = () => {
    setSwapSourceTableId(null)
  }

  const handleCompleteSwap = async (targetId: string) => {
    if (!swapSourceTableId) return
    setLoading(true)
    try {
      await swapTables(swapSourceTableId, targetId)
      setSwapSourceTableId(null)
      await loadData()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erro ao trocar mesas')
      setLoading(false)
    }
  }

  // ── Drag & Drop ───────────────────────────────────────────────────────── //

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    if (active.data.current?.type === 'Guest') {
      setActiveGuest(active.data.current.guest)
    }
  }

  const handleDragOver = (_event: DragOverEvent) => {
    // Only handle optimistic UI updates here if needed, but we'll do the actual move in DragEnd
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveGuest(null)
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find where the active guest came from
    let sourceTableId: string | null = null
    let guest: AdminGuest | undefined

    const unseated = unseatedGuests.find(g => g.id === activeId)
    if (unseated) {
      guest = unseated
    } else {
      for (const t of tables) {
        const found = t.guests?.find(g => g.id === activeId)
        if (found) {
          guest = found
          sourceTableId = t.id
          break
        }
      }
    }

    if (!guest) return

    // Find destination
    let destTableId: string | null = null

    // Is it dropped over the "unseated" container?
    if (overId === 'unseated') {
      destTableId = null
    }
    // Is it dropped over a specific table container?
    else if (String(overId).startsWith('table-')) {
      destTableId = String(overId).replace('table-', '')
    }
    // Is it dropped over another guest? Find that guest's container
    else {
      const overUnseated = unseatedGuests.find(g => g.id === overId)
      if (overUnseated) {
        destTableId = null
      } else {
        for (const t of tables) {
          if (t.guests?.some(g => g.id === overId)) {
            destTableId = t.id
            break
          }
        }
      }
    }

    // If source and destination are the same, do nothing
    if (sourceTableId === destTableId) return

    // If moving to a table, check capacity
    if (destTableId) {
      const destTable = tables.find(t => t.id === destTableId)
      if (destTable && (destTable.guests?.length || 0) >= destTable.capacity) {
        alert('A mesa já está cheia!')
        return
      }
    }

    // Optimistic UI update
    setUnseatedGuests(prev => prev.filter(g => g.id !== activeId))
    setTables(prev => prev.map(t => ({
      ...t,
      guests: t.guests?.filter(g => g.id !== activeId)
    })))

    if (destTableId === null) {
      setUnseatedGuests(prev => [{ ...guest!, table_id: null }, ...prev])
    } else {
      setTables(prev => prev.map(t => {
        if (t.id === destTableId) {
          return { ...t, guests: [...(t.guests || []), { ...guest!, table_id: destTableId }] }
        }
        return t
      }))
    }

    // API Call
    try {
      await assignGuestToTable(activeId, destTableId)
    } catch {
      alert('Erro ao mover convidado')
      loadData() // rollback
    }
  }

  return (
    <Box userSelect="none">
      <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap="4" mb="6">
        <Box>
          <Heading as="h1" size="3xl" color="purple.600" mb="1">
            Mesas
          </Heading>
          <Text color="gray.500">Distribua os convidados nas mesas do evento</Text>
        </Box>
        <Button colorPalette="purple" borderRadius="full" onClick={() => setShowSettings(true)}>
          ⚙️ Gerar Mesas
        </Button>
      </Flex>

      {/* Settings Modal */}
      {showSettings && (
        <Box p="6" mb="6" bg="white" borderRadius="2xl" boxShadow="md" borderWidth="1px" borderColor="purple.200">
          <Heading size="md" mb="4">Gerar Novas Mesas</Heading>
          <Flex gap="4" align="flex-end">
            <Box>
              <Text fontSize="sm" mb="1">Quantidade</Text>
              <Input type="number" value={genCount} onChange={(e) => setGenCount(e.target.value)} />
            </Box>
            <Box>
              <Text fontSize="sm" mb="1">Capacidade (Lugares)</Text>
              <Input type="number" value={genCap} onChange={(e) => setGenCap(e.target.value)} />
            </Box>
            <Button colorPalette="purple" onClick={handleGenerate}>Gerar</Button>
            <Button variant="outline" onClick={() => setShowSettings(false)}>Cancelar</Button>
          </Flex>
        </Box>
      )}

      {loading && <Spinner color="purple.500" mb="4" />}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Grid templateColumns={{ base: '1fr', lg: '300px 1fr' }} gap="6" alignItems="start">

          {/* Left Panel: Unseated Guests */}
          <Box
            // bg="gray.50"
            p="4"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="gray.200"
            minH="calc(100vh - 200px)"
            position={{ base: 'static', lg: 'sticky' }}
            top="-24px"
            maxH="calc(100vh - 200px)"
            overflowY="auto"
          >
            <Heading size="md" mb="2" color={theme === "light" ? "gray.700" : "gray.300"}>Sem Mesa</Heading>
            <Text fontSize="sm" color={theme === "light" ? "gray.500" : "gray.400"} mb="4">
              {unseatedGuests.length} convidados aguardando
            </Text>

            <UnseatedContainer unseatedGuests={unseatedGuests} />
          </Box>

          {/* Right Panel: Tables Grid */}
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }} gap="4">
            {tables.map(table => (
              <TableColumn
                key={table.id}
                table={table}
                guests={table.guests || []}
                onDelete={handleDelete}
                onUpdateCapacity={handleUpdateCapacity}
                swapSourceTableId={swapSourceTableId}
                onStartSwap={handleStartSwap}
                onCancelSwap={handleCancelSwap}
                onCompleteSwap={handleCompleteSwap}
              />
            ))}
          </Grid>

        </Grid>

        {/* Drag Overlay for smooth animations */}
        <DragOverlay>
          {activeGuest ? (
            <Box
              p="3"
              bg="white"
              borderWidth="2px"
              borderColor="purple.500"
              borderRadius="md"
              boxShadow="xl"
              opacity={0.8}
            >
              <Text fontSize="sm" fontWeight="600">{activeGuest.name}</Text>
            </Box>
          ) : null}
        </DragOverlay>

      </DndContext>
    </Box>
  )
}
