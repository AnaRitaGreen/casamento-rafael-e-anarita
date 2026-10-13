import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Input,
  Text,
  Spinner,
  Badge,
} from '@chakra-ui/react'
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Baby,
  User,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import {
  getBuffetSettings,
  updateBuffetSettings,
  type BuffetSettings,
} from '@/services/adminService'
import { toaster } from '@/components/ui/toaster'
import { useColorMode } from '@/components/ui/color-mode'

export function Settings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Estados dos inputs
  const [freeMaxAge, setFreeMaxAge] = useState<number | string>(5)
  const [halfMaxAge, setHalfMaxAge] = useState<number | string>(11)

  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const navigate = useNavigate()

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)
      setErrorMessage(null)
      try {
        const data: BuffetSettings = await getBuffetSettings()
        setFreeMaxAge(data.free_max_age)
        setHalfMaxAge(data.half_max_age)
      } catch (err: unknown) {
        const axiosErr = err as AxiosError<{ message?: string }>
        if (axiosErr?.response?.status === 401) {
          navigate('/login')
          return
        }
        setErrorMessage(
          axiosErr?.response?.data?.message ||
          'Não foi possível carregar as configurações do buffet.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [navigate])

  const freeNum = freeMaxAge === '' ? NaN : Number(freeMaxAge)
  const halfNum = halfMaxAge === '' ? NaN : Number(halfMaxAge)

  // Validação em tempo real
  const isInvalid =
    isNaN(freeNum) ||
    isNaN(halfNum) ||
    freeNum < 0 ||
    halfNum <= freeNum

  const validationError = (() => {
    if (isNaN(freeNum) || freeNum < 0) {
      return 'A idade máxima para não pagar deve ser um número maior ou igual a 0.'
    }
    if (isNaN(halfNum) || halfNum < 1) {
      return 'A idade máxima para pagar meia deve ser de pelo menos 1 ano.'
    }
    if (halfNum <= freeNum) {
      return `A idade máxima para pagar meia (${halfNum}) deve ser maior que a idade de gratuidade (${freeNum}).`
    }
    return null
  })()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isInvalid) return

    setSaving(true)
    setErrorMessage(null)
    setSavedSuccess(false)

    try {
      await updateBuffetSettings({
        free_max_age: freeNum,
        half_max_age: halfNum,
      })
      setSavedSuccess(true)
      toaster.create({
        title: 'Configurações salvas!',
        description: 'As regras de idade do buffet foram atualizadas com sucesso.',
        type: 'success',
      })
      setTimeout(() => setSavedSuccess(false), 4000)
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>
      const message =
        axiosErr?.response?.data?.message ||
        'Ocorreu um erro ao salvar as configurações.'
      setErrorMessage(message)
      toaster.create({
        title: 'Erro ao salvar',
        description: message,
        type: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  // Cálculos reativos
  const halfStartAge = !isNaN(freeNum) ? freeNum + 1 : 1
  const fullStartAge = !isNaN(halfNum) ? halfNum + 1 : halfStartAge + 1

  return (
    <Box>
      {/* Cabeçalho */}
      <Box mb="8">
        <Heading as="h1" size="3xl" color="purple.600" mb="1">
          Configurações
        </Heading>
        <Text color="gray.500" fontSize="md">
          Gerencie as regras do buffet e preferências do evento
        </Text>
      </Box>

      {loading ? (
        <Flex justify="center" align="center" py="16" gap="3">
          <Spinner size="lg" color="purple.500" />
          <Text color="gray.500" fontSize="lg">
            Carregando configurações...
          </Text>
        </Flex>
      ) : (
        <form onSubmit={handleSave}>
          <Box
            bg={isDark ? 'gray.800' : 'white'}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor={isDark ? 'whiteAlpha.200' : 'purple.100'}
            boxShadow="sm"
            p={{ base: '4' }}
            mb="4"
          >
            {/* Header da Seção de Buffet */}
            <Flex
              align="center"
              gap="3"
              pb="4"
              mb="4"
              borderBottomWidth="1px"
              borderColor={isDark ? 'whiteAlpha.100' : 'gray.100'}
            >
              <Box>
                <Heading as="h2" size="xl" color={isDark ? 'white' : 'gray.800'}>
                  Configuração de Idade do Buffet
                </Heading>
                <Text color="gray.500" fontSize="sm">
                  Defina os limites de idade para isenção, meia-entrada e valor integral do buffet.
                </Text>
              </Box>
            </Flex>

            {/* Campos de Configuração */}
            <Flex direction="column" gap="2" mb="4">
              {/* Opção 1: Não paga */}
              <Box
                px="4"
                py="2"
                borderRadius="xl"
                bg={isDark ? 'whiteAlpha.50' : 'green.50'}
                borderWidth="1px"
                borderColor={isDark ? 'green.800' : 'green.200'}
                transition="all 0.2s"
              >
                <Flex
                  direction={{ base: 'column', sm: 'row' }}
                  align={{ base: 'flex-start', sm: 'center' }}
                  justify="space-between"
                  gap="4"
                >
                  <Flex align="center" gap="3">
                    <Box
                      p="2"
                      borderRadius="md"
                      bg={isDark ? 'green.900' : 'green.100'}
                      color={isDark ? 'green.300' : 'green.700'}
                    >
                      <Baby size={20} />
                    </Box>
                    <Box>
                      <Text fontWeight="700" fontSize="md" color={isDark ? 'green.300' : 'green.800'}>
                        Não paga
                      </Text>
                      <Text fontSize="xs" color={isDark ? 'whiteAlpha.700' : 'green.700'}>
                        Crianças isentas de cobrança
                      </Text>
                    </Box>
                  </Flex>

                  {/* Input format: "até [input] anos" */}
                  <Flex align="center" gap="2.5" flexWrap="nowrap">
                    <Text
                      fontWeight="600"
                      fontSize="sm"
                      color={isDark ? 'whiteAlpha.800' : 'gray.700'}
                      whiteSpace="nowrap"
                    >
                      até
                    </Text>
                    <Input
                      type="number"
                      min={0}
                      max={120}
                      w="80px"
                      textAlign="center"
                      fontWeight="700"
                      fontSize="md"
                      borderRadius="lg"
                      bg={isDark ? 'gray.900' : 'white'}
                      borderColor={isDark ? 'whiteAlpha.300' : 'green.300'}
                      _focus={{ borderColor: 'green.500', boxShadow: '0 0 0 1px #22c55e' }}
                      value={freeMaxAge}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Number(e.target.value)
                        setFreeMaxAge(val)
                      }}
                      required
                    />
                    <Text
                      fontWeight="600"
                      fontSize="sm"
                      color={isDark ? 'whiteAlpha.800' : 'gray.700'}
                      whiteSpace="nowrap"
                    >
                      anos
                    </Text>
                  </Flex>
                </Flex>
              </Box>

              {/* Opção 2: Paga meia */}
              <Box
                px="4"
                py="2"
                borderRadius="xl"
                bg={isDark ? 'whiteAlpha.50' : 'amber.50'}
                borderWidth="1px"
                borderColor={isDark ? 'yellow.800' : 'amber.200'}
                transition="all 0.2s"
              >
                <Flex
                  direction={{ base: 'column', sm: 'row' }}
                  align={{ base: 'flex-start', sm: 'center' }}
                  justify="space-between"
                  gap="4"
                >
                  <Flex align="center" gap="3">
                    <Box
                      p="2"
                      borderRadius="md"
                      bg={isDark ? 'yellow.900' : 'amber.100'}
                      color={isDark ? 'yellow.300' : 'amber.800'}
                    >
                      <User size={20} />
                    </Box>
                    <Box>
                      <Text fontWeight="700" fontSize="md" color={isDark ? 'yellow.300' : 'amber.900'}>
                        Paga meia
                      </Text>
                      <Text fontSize="xs" color={isDark ? 'whiteAlpha.700' : 'amber.700'}>
                        Convidados que pagam 50% do valor
                      </Text>
                    </Box>
                  </Flex>

                  {/* Input format: "de (não paga + 1) até [input] anos" */}
                  <Flex align="center" gap="2.5" flexWrap="nowrap">
                    <Text
                      fontWeight="600"
                      fontSize="sm"
                      color={isDark ? 'whiteAlpha.800' : 'gray.700'}
                      whiteSpace="nowrap"
                    >
                      de{' '}
                      <Text as="span" color="purple.600" fontWeight="700">
                        {halfStartAge}
                      </Text>{' '}
                      até
                    </Text>
                    <Input
                      type="number"
                      min={halfStartAge}
                      max={120}
                      w="80px"
                      textAlign="center"
                      fontWeight="700"
                      fontSize="md"
                      borderRadius="lg"
                      bg={isDark ? 'gray.900' : 'white'}
                      borderColor={isDark ? 'whiteAlpha.300' : 'amber.300'}
                      _focus={{ borderColor: 'amber.500', boxShadow: '0 0 0 1px #f59e0b' }}
                      value={halfMaxAge}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Number(e.target.value)
                        setHalfMaxAge(val)
                      }}
                      required
                    />
                    <Text
                      fontWeight="600"
                      fontSize="sm"
                      color={isDark ? 'whiteAlpha.800' : 'gray.700'}
                      whiteSpace="nowrap"
                    >
                      anos
                    </Text>
                  </Flex>
                </Flex>
              </Box>

              {/* Opção 3: Paga inteira */}
              <Box
                px="4"
                py="2"
                borderRadius="xl"
                bg={isDark ? 'whiteAlpha.50' : 'purple.50'}
                borderWidth="1px"
                borderColor={isDark ? 'purple.800' : 'purple.200'}
                transition="all 0.2s"
              >
                <Flex
                  direction={{ base: 'column', sm: 'row' }}
                  align={{ base: 'flex-start', sm: 'center' }}
                  justify="space-between"
                  gap="4"
                >
                  <Flex align="center" gap="3">
                    <Box
                      p="2"
                      borderRadius="md"
                      bg={isDark ? 'purple.900' : 'purple.100'}
                      color={isDark ? 'purple.300' : 'purple.700'}
                    >
                      <Users size={20} />
                    </Box>
                    <Box>
                      <Text fontWeight="700" fontSize="md" color={isDark ? 'purple.300' : 'purple.800'}>
                        Paga inteira
                      </Text>
                      <Text fontSize="xs" color={isDark ? 'whiteAlpha.700' : 'purple.700'}>
                        Convidados que pagam valor integral (100%)
                      </Text>
                    </Box>
                  </Flex>

                  {/* Informação automática: "a partir de (paga meia + 1)" */}
                  <Flex align="center" gap="2">
                    <Badge
                      colorPalette="purple"
                      variant="solid"
                      size="lg"
                      px="4"
                      py="1.5"
                      borderRadius="full"
                      fontSize="sm"
                      fontWeight="700"
                    >
                      a partir de {fullStartAge} anos
                    </Badge>
                  </Flex>
                </Flex>
              </Box>
            </Flex>

            {/* Visual Preview / Resumo das Faixas */}
            <Box
              mb="4"
              p="4"
              borderRadius="xl"
              bg={isDark ? 'gray.900' : 'gray.50'}
              borderWidth="1px"
              borderColor={isDark ? 'whiteAlpha.100' : 'gray.200'}
            >
              <Text
                fontSize="xs"
                fontWeight="700"
                textTransform="uppercase"
                letterSpacing="0.08em"
                color="gray.500"
                mb="3"
              >
                Resumo em tempo real da política do buffet
              </Text>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap="3">
                <Box
                  p="2"
                  borderRadius="lg"
                  bg={isDark ? 'gray.800' : 'white'}
                  borderWidth="1px"
                  borderColor={isDark ? 'whiteAlpha.100' : 'gray.200'}
                >
                  <Text fontSize="xs" color="gray.500" mb="1">
                    Faixa 1 — Gratuita
                  </Text>
                  <Text fontWeight="700" fontSize="md" color="green.500">
                    0 até {isNaN(freeNum) ? '?' : freeNum} anos
                  </Text>
                  <Text fontSize="xs" color="gray.500" mt="0.5">
                    Não paga nada
                  </Text>
                </Box>
                <Box
                  p="2"
                  borderRadius="lg"
                  bg={isDark ? 'gray.800' : 'white'}
                  borderWidth="1px"
                  borderColor={isDark ? 'whiteAlpha.100' : 'gray.200'}
                >
                  <Text fontSize="xs" color="gray.500" mb="1">
                    Faixa 2 — Meia-Entrada
                  </Text>
                  <Text fontWeight="700" fontSize="md" color="amber.500">
                    {halfStartAge} até {isNaN(halfNum) ? '?' : halfNum} anos
                  </Text>
                  <Text fontSize="xs" color="gray.500" mt="0.5">
                    Paga 50% do valor
                  </Text>
                </Box>
                <Box
                  p="2"
                  borderRadius="lg"
                  bg={isDark ? 'gray.800' : 'white'}
                  borderWidth="1px"
                  borderColor={isDark ? 'whiteAlpha.100' : 'gray.200'}
                >
                  <Text fontSize="xs" color="gray.500" mb="1">
                    Faixa 3 — Inteira
                  </Text>
                  <Text fontWeight="700" fontSize="md" color="purple.500">
                    {fullStartAge}+ anos
                  </Text>
                  <Text fontSize="xs" color="gray.500" mt="0.5">
                    Paga valor completo (100%)
                  </Text>
                </Box>
              </Grid>
            </Box>

            {/* Mensagem de Erro de Validação */}
            {validationError && (
              <Flex
                align="center"
                gap="2.5"
                p="4"
                mb="6"
                borderRadius="xl"
                bg={isDark ? 'red.950' : 'red.50'}
                borderWidth="1px"
                borderColor={isDark ? 'red.800' : 'red.200'}
                color={isDark ? 'red.300' : 'red.600'}
                fontSize="sm"
              >
                <AlertCircle size={18} />
                <Text fontWeight="500">{validationError}</Text>
              </Flex>
            )}

            {/* Alerta de Erro de API */}
            {errorMessage && !validationError && (
              <Flex
                align="center"
                gap="2.5"
                p="4"
                mb="6"
                borderRadius="xl"
                bg={isDark ? 'red.950' : 'red.50'}
                borderWidth="1px"
                borderColor={isDark ? 'red.800' : 'red.200'}
                color={isDark ? 'red.300' : 'red.600'}
                fontSize="sm"
              >
                <AlertCircle size={18} />
                <Text fontWeight="500">{errorMessage}</Text>
              </Flex>
            )}

            {/* Feedback de Sucesso inline */}
            {savedSuccess && (
              <Flex
                align="center"
                gap="2.5"
                p="4"
                mb="6"
                borderRadius="xl"
                bg={isDark ? 'green.950' : 'green.50'}
                borderWidth="1px"
                borderColor={isDark ? 'green.800' : 'green.200'}
                color={isDark ? 'green.300' : 'green.700'}
                fontSize="sm"
              >
                <CheckCircle2 size={18} />
                <Text fontWeight="600">Configurações salvas com sucesso no banco de dados!</Text>
              </Flex>
            )}

            {/* Botão de Salvar */}
            <Flex justify="flex-end">
              <Button
                type="submit"
                colorPalette="purple"
                size="lg"
                borderRadius="full"
                px="8"
                disabled={Boolean(isInvalid || saving)}
                loading={saving}
                boxShadow="md"
                _hover={{ transform: 'translateY(-1px)', boxShadow: 'lg' }}
                transition="all 0.2s"
              >
                <Save size={18} />
                Salvar Configurações
              </Button>
            </Flex>
          </Box>
        </form>
      )}
    </Box>
  )
}
