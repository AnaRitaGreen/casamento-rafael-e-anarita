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

const LabelText = Text as any

export function GroupModal({ isOpen, onClose, onSave, editing }: GroupModalProps) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [gaveGift, setGaveGift] = useState(false)
  const [giftDescription, setGiftDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setName(editing?.name ?? '')
      setSlug(editing?.slug ?? '')
      setGaveGift(Boolean(editing?.gave_gift))
      setGiftDescription(editing?.gift_description ?? '')
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

  const handleGiftDescriptionChange = (val: string) => {
    setGiftDescription(val)
    if (val.trim() && !gaveGift) {
      setGaveGift(true)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError('')
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        gave_gift: gaveGift,
        gift_description: giftDescription.trim() || null,
      }
      if (editing) {
        await updateGroup(editing.id, payload)
      } else {
        await createGroup(payload)
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

          <Box mb="4">
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

          <Flex mb="4" align="center" gap="3">
            <input
              type="checkbox"
              id="group-gave-gift"
              style={{ width: '18px', height: '18px', accentColor: '#7c3aed', cursor: 'pointer' }}
              checked={gaveGift}
              onChange={(e) => setGaveGift(e.target.checked)}
            />
            <LabelText
              as="label"
              htmlFor="group-gave-gift"
              fontSize="sm"
              fontWeight="600"
              color="gray.700"
              cursor="pointer"
            >
              Confirmar que o grupo deu presente 🎁
            </LabelText>
          </Flex>

          <Box mb="6">
            <Text fontSize="sm" fontWeight="600" color="gray.600" mb="1.5">
              Qual presente foi? (opcional)
            </Text>
            <Input
              borderRadius="xl"
              borderColor="purple.200"
              value={giftDescription}
              onChange={(e) => handleGiftDescriptionChange(e.target.value)}
              placeholder="Ex: PIX R$ 200, Jogo de jantar..."
            />
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