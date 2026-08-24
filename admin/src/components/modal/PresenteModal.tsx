import React, { useState, useEffect } from 'react'
import { Box, Button, Flex, Heading, Input, Text } from '@chakra-ui/react'
import { createPresente, updatePresente } from '@/services/adminService'

interface PresenteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  editingPresenteId: string | null
  initialData?: {
    title: string
    description: string
    value: number
    image: string
    link: string
  }
}

export function PresenteModal({
  isOpen,
  onClose,
  onSave,
  editingPresenteId,
  initialData,
}: PresenteModalProps) {
  const [presenteForm, setPresenteForm] = useState({
    title: '',
    description: '',
    value: '',
    image: '',
    link: '',
  })

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setPresenteForm({
          title: initialData.title,
          description: initialData.description,
          value: String(initialData.value),
          image: initialData.image,
          link: initialData.link,
        })
      } else {
        setPresenteForm({ title: '', description: '', value: '', image: '', link: '' })
      }
    }
  }, [isOpen, initialData])

  const savePresente = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      title: presenteForm.title,
      description: presenteForm.description || undefined,
      value: Number(presenteForm.value),
      image: presenteForm.image || undefined,
      link: presenteForm.link || undefined,
    }

    try {
      if (editingPresenteId) await updatePresente(editingPresenteId, payload)
      else await createPresente(payload)
      onSave()
    } catch {
      alert('Erro ao salvar presente.')
    }
  }

  if (!isOpen) return null

  return (
    <Flex
      position="fixed"
      inset="0"
      zIndex="1001"
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
        maxH="90vh"
        overflowY="auto"
      >
        <Heading as="h2" size="xl" color="purple.700" mb="6">
          {editingPresenteId ? 'Editar Presente' : 'Adicionar Presente'}
        </Heading>
        <Flex as="form" direction="column" gap="4" onSubmit={savePresente}>
          <Box>
            <Text fontSize="sm" fontWeight="600" color="gray.600" mb="1.5">
              Nome *
            </Text>
            <Input
              type="text"
              required
              borderRadius="xl"
              borderColor="purple.200"
              value={presenteForm.title}
              onChange={(e) => setPresenteForm({ ...presenteForm, title: e.target.value })}
            />
          </Box>
          <Box>
            <Text fontSize="sm" fontWeight="600" color="gray.600" mb="1.5">
              Descrição
            </Text>
            <Input
              type="text"
              borderRadius="xl"
              borderColor="purple.200"
              value={presenteForm.description}
              onChange={(e) => setPresenteForm({ ...presenteForm, description: e.target.value })}
            />
          </Box>
          <Box>
            <Text fontSize="sm" fontWeight="600" color="gray.600" mb="1.5">
              Preço (R$) *
            </Text>
            <Input
              type="number"
              step="0.01"
              min="0"
              required
              borderRadius="xl"
              borderColor="purple.200"
              value={presenteForm.value}
              onChange={(e) => setPresenteForm({ ...presenteForm, value: e.target.value })}
            />
          </Box>
          <Box>
            <Text fontSize="sm" fontWeight="600" color="gray.600" mb="1.5">
              URL da Imagem (opcional)
            </Text>
            <Input
              type="url"
              placeholder="https://..."
              borderRadius="xl"
              borderColor="purple.200"
              value={presenteForm.image}
              onChange={(e) => setPresenteForm({ ...presenteForm, image: e.target.value })}
            />
          </Box>
          <Box mb="2">
            <Text fontSize="sm" fontWeight="600" color="gray.600" mb="1.5">
              Link de Compra (opcional)
            </Text>
            <Input
              type="url"
              placeholder="https://www.amazon.com.br/..."
              borderRadius="xl"
              borderColor="purple.200"
              value={presenteForm.link}
              onChange={(e) => setPresenteForm({ ...presenteForm, link: e.target.value })}
            />
            <Text fontSize="xs" color="gray.500" mt="1">
              Exibido como botão "Ver Produto" na página de presentes.
            </Text>
          </Box>
          <Flex gap="3">
            <Button type="button" flex="1" variant="outline" borderRadius="full" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" flex="1" colorPalette="purple" borderRadius="full">
              💾 Salvar
            </Button>
          </Flex>
        </Flex>
      </Box>
    </Flex>
  )
}