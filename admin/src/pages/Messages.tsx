import { useEffect, useState } from 'react'
import { Box, Flex, Heading, Spinner, Text } from '@chakra-ui/react'
import { getAdminMessages, type AdminMessage } from '@/services/adminService'
import { useNavigate } from 'react-router-dom'

export function Messages() {
  const [messages, setMessages] = useState<AdminMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    setMessagesLoading(true)
    try {
      const msgs = await getAdminMessages()
      setMessages(msgs)
    } catch (err: any) {
      if (err?.response?.status === 401) navigate('/login')
    } finally {
      setMessagesLoading(false)
    }
  }

  return (
    <Box>
      <Heading as="h1" size="3xl" color="purple.600" mb="1">
        Mensagens
      </Heading>
      <Text color="gray.500" mb="6">
        Mensagens carinhosas dos seus convidados
      </Text>

      <Flex direction="column" gap="4">
        {messagesLoading && (
          <Flex justify="center" py="8" gap="3" align="center">
            <Spinner size="sm" color="purple.500" />
            <Text color="gray.500">Carregando mensagens...</Text>
          </Flex>
        )}
        {!messagesLoading && messages.length === 0 && (
          <Text color="gray.400" textAlign="center" py="8">
            Nenhuma mensagem ainda. 💜
          </Text>
        )}
        {messages.map((m) => (
          <Box
            key={m.id}
            bg="bg.panel"
            borderRadius="2xl"
            p="6"
            borderWidth="1px"
            borderColor="border"
            boxShadow="sm"
          >
            <Text fontWeight="700" color="purple.700" mb="1">
              {m.group_name}
            </Text>
            <Text color="gray.500" fontStyle="italic" fontSize="sm" mb="3">
              "{m.message}"
            </Text>
            <Text fontSize="xs" color="gray.400">
              {new Date(m.created_at).toLocaleDateString('pt-BR')}
            </Text>
          </Box>
        ))}
      </Flex>
    </Box>
  )
}