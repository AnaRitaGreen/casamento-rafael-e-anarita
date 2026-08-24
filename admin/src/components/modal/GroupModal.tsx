import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
} from '@chakra-ui/react'
import {
  createGroup,
  updateGroup,
  type AdminGroup,
} from '@/services/adminService'

interface GroupModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  editing: AdminGroup | null
}

export function GroupModal({ isOpen, onClose, onSave, editing }: GroupModalProps) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setName(editing?.name ?? '')
      setSlug(editing?.slug ?? '')
      setError('')
    }
  }, [isOpen, editing])

  const handleNameChange = (val: string) => {
    setName(val)
    if (!editing) {
      setSlug(
        val
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-'),
      )
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError('')
    try {
      if (editing) {
        await updateGroup(editing.id, { name: name.trim(), slug: slug.trim() || undefined })
      } else {
        await createGroup({ name: name.trim(), slug: slug.trim() || undefined })
      }
      onSave()
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setError(msg ?? 'Erro ao salvar grupo.')
    } finally {
      setSaving(false)
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
        maxW="440px"
        p="8"
        m="4"
      >
        <Heading as="h2" size="xl" color="purple.700" mb="6">
          {editing ? 'Editar Grupo' : 'Novo Grupo'}
        </Heading>

        <form onSubmit={handleSave}>
          <Box mb="4">
            <Text fontSize="sm" fontWeight="600" color="gray.600" mb="1.5">
              Nome do Grupo *
            </Text>
            <Input
              required
              borderRadius="xl"
              borderColor="purple.200"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex: Família Silva"
            />
          </Box>

          <Box mb="6">
            <Text fontSize="sm" fontWeight="600" color="gray.600" mb="1.5">
              Slug (URL personalizada)
            </Text>
            <Input
              borderRadius="xl"
              borderColor="purple.200"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="familia-silva"
            />
            <Text fontSize="xs" color="gray.500" mt="1">
              Link do convite: <strong>/nome-do-slug</strong>
            </Text>
          </Box>

          {error && (
            <Box
              bg="red.50"
              borderWidth="1px"
              borderColor="red.200"
              borderRadius="xl"
              p="3"
              mb="4"
              fontSize="sm"
              color="red.600"
            >
              ⚠️ {error}
            </Box>
          )}

          <Flex gap="3">
            <Button
              type="submit"
              flex="1"
              colorPalette="purple"
              borderRadius="full"
              disabled={saving}
            >
              {saving ? 'Salvando...' : '💾 Salvar'}
            </Button>
            <Button
              type="button"
              flex="1"
              variant="outline"
              borderRadius="full"
              onClick={onClose}
            >
              Cancelar
            </Button>
          </Flex>
        </form>
      </Box>
    </Flex>
  )
}