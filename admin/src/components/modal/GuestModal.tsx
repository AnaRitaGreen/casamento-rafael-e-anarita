import React, { useState, useEffect } from 'react'
import { Box, Button, Flex, Heading, Input, Text } from '@chakra-ui/react'
import { createGuest, updateGuest, getAdminGroups, type AdminGroup } from '@/services/adminService'

interface GuestModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  editingGuestId: string | null
  initialData?: {
    name: string
    group_id: string
    group_name: string
    is_child: boolean
  }
}

export function GuestModal({ isOpen, onClose, onSave, editingGuestId, initialData }: GuestModalProps) {
  const [guestForm, setGuestForm] = useState({ name: '', group_id: '', group_name: '', is_child: false })
  const [groups, setGroups] = useState<AdminGroup[]>([])

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setGuestForm(initialData)
      } else {
        setGuestForm({ name: '', group_id: '', group_name: '', is_child: false })
      }
      loadGroups()
    }
  }, [isOpen, initialData])

  const loadGroups = async () => {
    try {
      const data = await getAdminGroups()
      setGroups(data)
    } catch {}
  }

  const saveGuest = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      name: guestForm.name,
      group_id: guestForm.group_id || undefined,
      group_name: guestForm.group_name || undefined,
      is_child: guestForm.is_child,
    }

    try {
      if (editingGuestId) await updateGuest(editingGuestId, payload)
      else await createGuest(payload)
      onSave()
    } catch {
      alert('Erro ao salvar convidado.')
    }
  }

  if (!isOpen) return null

  return (
    <Flex
      position="fixed"
      inset="0"
      zIndex="1000"
      bg="blackAlpha.400"
      backdropFilter="blur(4px)"
      align="center"
      justify="center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <Box
        bg="white"
        borderRadius="2xl"
        boxShadow="xl"
        w="100%"
        maxW="480px"
        p="8"
        m="4"
      >
        <Heading as="h2" size="xl" color="purple.700" mb="6">
          {editingGuestId ? 'Editar Convidado' : 'Adicionar Convidado'}
        </Heading>
        <form onSubmit={saveGuest}>
          <Box mb="4">
            <Text fontSize="sm" fontWeight="600" color="gray.600" mb="1.5">
              Nome Completo *
            </Text>
            <Input
              type="text"
              required
              borderRadius="xl"
              borderColor="purple.200"
              value={guestForm.name}
              onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })}
            />
          </Box>
          <Box mb="4">
            <Text fontSize="sm" fontWeight="600" color="gray.600" mb="1.5">
              Grupo Familiar
            </Text>
            <Box
              as="select"
              w="100%"
              px="4"
              py="2.5"
              borderRadius="xl"
              borderWidth="1px"
              borderColor="purple.200"
              bg="white"
              fontSize="sm"
              value={guestForm.group_id}
              onChange={(e: any) => setGuestForm({ ...guestForm, group_id: e.target.value })}
            >
              <option value="">— Sem grupo / criar novo —</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </Box>
          </Box>
          <Box mb="4">
            <Text fontSize="sm" fontWeight="600" color="gray.600" mb="1.5">
              Nome do Novo Grupo (se criar)
            </Text>
            <Input
              type="text"
              borderRadius="xl"
              borderColor="purple.200"
              value={guestForm.group_name}
              onChange={(e) => setGuestForm({ ...guestForm, group_name: e.target.value })}
            />
          </Box>
          <Flex mb="6" align="center" gap="3">
            <input
              type="checkbox"
              id="g-crianca"
              style={{ width: '18px', height: '18px', accentColor: '#7c3aed' }}
              checked={guestForm.is_child}
              onChange={(e) => setGuestForm({ ...guestForm, is_child: e.target.checked })}
            />
            <Text as="label" htmlFor="g-crianca" fontSize="sm" cursor="pointer">
              É criança?
            </Text>
          </Flex>
          <Flex gap="3">
            <Button type="button" flex="1" variant="outline" borderRadius="full" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" flex="1" colorPalette="purple" borderRadius="full">
              💾 Salvar
            </Button>
          </Flex>
        </form>
      </Box>
    </Flex>
  )
}