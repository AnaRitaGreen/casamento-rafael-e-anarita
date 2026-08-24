import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
} from '@chakra-ui/react'
import { Eye, EyeOff } from 'lucide-react'
import { adminLogin } from '@/services/adminService'

export function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      await adminLogin(username, password)
      navigate('/')
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setErrorMsg('❌ Usuário ou senha incorretos.')
      } else {
        setErrorMsg('⚠️ Servidor indisponível. Verifique a conexão.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      p={{ base: '4', md: '8' }}
      bgGradient="to-br"
      bg="purple.50"
    >
      <Box
        w="100%"
        maxW="420px"
        bg="white"
        borderRadius="2xl"
        boxShadow="xl"
        p={{ base: '6', md: '10' }}
        borderWidth="1px"
        borderColor="gray.100"
      >
        <Box textAlign="center" mb="8">
          <Heading
            as="h1"
            size="2xl"
            color="purple.700"
            mt="3"
            mb="1"
          >
            Painel dos Noivos
          </Heading>
        </Box>

        <form onSubmit={handleLogin}>
          <Box mb="5">
            <Text
              as="label"
              htmlFor="username"
              display="block"
              fontSize="sm"
              fontWeight="600"
              color="gray.600"
              mb="1.5"
            >
              Usuário
            </Text>
            <Input
              type="text"
              id="username"
              name="username"
              placeholder="seu usuário"
              autoComplete="username"
              required
              size="lg"
              borderRadius="xl"
              borderColor="purple.200"
              _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 3px rgba(147, 112, 219, 0.15)' }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Box>

          <Box mb="7">
            <Text
              as="label"
              htmlFor="password"
              display="block"
              fontSize="sm"
              fontWeight="600"
              color="gray.600"
              mb="1.5"
            >
              Senha
            </Text>
            <Box position="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                size="lg"
                borderRadius="xl"
                borderColor="purple.200"
                pr="12"
                _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 3px rgba(147, 112, 219, 0.15)' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Flex
                as="button"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                position="absolute"
                right="3"
                top="50%"
                transform="translateY(-50%)"
                bg="transparent"
                border="none"
                cursor="pointer"
                color="gray.400"
                _hover={{ color: 'gray.600' }}
                align="center"
                justify="center"
                p="1"
                aria-label="Mostrar/ocultar senha"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </Flex>
            </Box>
          </Box>

          {errorMsg && (
            <Box
              p="3"
              bg="red.50"
              borderRadius="xl"
              borderWidth="1px"
              borderColor="red.200"
              color="red.600"
              fontSize="sm"
              mb="4"
            >
              {errorMsg}
            </Box>
          )}

          <Button
            type="submit"
            w="100%"
            size="lg"
            colorPalette="purple"
            borderRadius="full"
            fontSize="md"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar no Painel'}
          </Button>
        </form>

        <Text textAlign="center" mt="6">
          <Box
            as="a"
            href="/"
            color="purple.500"
            fontSize="sm"
            textDecoration="none"
            opacity={0.7}
            _hover={{ opacity: 1 }}
          >
            ← Voltar ao site
          </Box>
        </Text>
      </Box>
    </Flex>
  )
}
