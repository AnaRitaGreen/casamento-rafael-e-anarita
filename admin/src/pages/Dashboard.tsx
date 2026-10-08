import { useState, useEffect } from 'react'
import { Box, Button, Flex, Grid, Heading, Text, Spinner } from '@chakra-ui/react'
import { Download } from 'lucide-react'
import { exportGuestsPDF, getAdminGuests } from '@/services/adminService'
import { useNavigate } from 'react-router-dom'
import { StatCard } from '@/components/StatCard'

export function Dashboard() {
  const [loading, setLoading] = useState(false)
  const [metrics, setMetrics] = useState({ total: 0, confirmed: 0, declined: 0, pending: 0, pct: 0 })
  const navigate = useNavigate()

  useEffect(() => {
    loadOverview()
  }, [])

  const exportPDFData = async (type: 'all' | 'confirmed' | 'tables') => {
    try {
      const blob = await exportGuestsPDF(type)
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `convidados_${type}_${new Date().toISOString().slice(0, 10)}.pdf`
      a.click()
    } catch {
      alert('Erro ao exportar. Verifique se o backend está rodando.')
    }
  }

  const loadOverview = async () => {
    setLoading(true)
    try {
      const guestsData = await getAdminGuests()
      const total = guestsData.length
      const confirmed = guestsData.filter((g) => g.rsvp_status === 'attending').length
      const declined = guestsData.filter((g) => g.rsvp_status === 'declined').length
      const pending = guestsData.filter((g) => g.rsvp_status === 'pending').length
      const pct = total > 0 ? Math.round((confirmed / total) * 100) : 0
      setMetrics({ total, confirmed, declined, pending, pct })
    } catch (err: any) {
      if (err?.response?.status === 401) {
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      {/* Overview Section */}
      <Box mb="8">
        <Heading as="h1" size="3xl" color="purple.600" mb="1">
          Visão Geral
        </Heading>
        <Text color="gray.500" mb="6">
          Atualizado em tempo real
        </Text>

        <Grid
          templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
          gap="5"
          mb="8"
        >
          <StatCard
            value={loading ? '—' : metrics.total}
            label="Total de Convidados"
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
          <StatCard
            value={loading ? '—' : metrics.confirmed}
            label="Confirmados ✅"
            gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
          />
          <StatCard
            value={loading ? '—' : metrics.declined}
            label="Não vão ❌"
            gradient="linear-gradient(135deg, #d3145a 0%, #f093fb 100%)"
          />
          <StatCard
            value={loading ? '—' : metrics.pending}
            label="Pendentes ⏳"
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          />
        </Grid>

        {/* Progress */}
        <Box
          bg="bg.panel"
          borderRadius="2xl"
          p="6"
          mb="6"
          borderWidth="1px"
          borderColor="border"
          boxShadow="sm"
        >
          <Flex justify="space-between" mb="3">
            <Text fontWeight="600">Progresso de Confirmações</Text>
            <Text color="purple.600" fontWeight="700">{metrics.pct}%</Text>
          </Flex>
          <Box bg="purple.100" borderRadius="full" h="3" overflow="hidden">
            <Box
              h="100%"
              w={`${metrics.pct}%`}
              bgGradient="to-r"
              borderRadius="full"
              transition="width 1s ease"
              bg="purple.500"
            />
          </Box>
          <Flex justify="space-between" mt="2" fontSize="xs" color="gray.500">
            <Text>{metrics.confirmed} confirmados</Text>
            <Text>de {metrics.total} convidados</Text>
          </Flex>
        </Box>

        {loading && (
          <Flex justify="center" py="8" gap="3" align="center">
            <Spinner size="sm" color="purple.500" />
            <Text color="gray.500">Carregando dados...</Text>
          </Flex>
        )}
      </Box>

      {/* Export Section */}
      <Box>
        <Heading as="h2" size="2xl" color="purple.600" mb="1">
          Exportar Lista
        </Heading>
        <Text color="gray.500" mb="6">
          Baixe a lista de convidados para compartilhar com o cerimonial
        </Text>
        <Grid gap="5" templateColumns={{ base: '1fr', lg: 'repeat(3, 1fr)' }}>
          <Box
            bg="bg.panel"
            borderRadius="2xl"
            p="6"
            borderWidth="1px"
            borderColor="border"
            boxShadow="sm"
          >
            <Heading as="h3" size="lg" color="purple.600" mb="2">
              📄 Lista Completa (PDF)
            </Heading>
            <Text color="gray.500" fontSize="sm" mb="5">
              Todos os convidados com nome, grupo e status.
            </Text>
            <Button
              w="100%"
              colorPalette="purple"
              onClick={() => exportPDFData('all')}
              size="lg"
              borderRadius="full"
            >
              <Download size={16} />
              Baixar Todos
            </Button>
          </Box>
          <Box
            bg="bg.panel"
            borderRadius="2xl"
            p="6"
            borderWidth="1px"
            borderColor="border"
            boxShadow="sm"
          >
            <Heading as="h3" size="lg" color="green.600" mb="2">
              ✅ Apenas Confirmados (PDF)
            </Heading>
            <Text color="gray.500" fontSize="sm" mb="5">
              Somente os convidados que confirmaram presença.
            </Text>
            <Button
              w="100%"
              variant="outline"
              colorPalette="green"
              onClick={() => exportPDFData('confirmed')}
              size="lg"
              borderRadius="full"
            >
              <Download size={16} />
              Baixar Confirmados
            </Button>
          </Box>
          <Box
            bg="bg.panel"
            borderRadius="2xl"
            p="6"
            borderWidth="1px"
            borderColor="border"
            boxShadow="sm"
          >
            <Heading as="h3" size="lg" color="blue.600" mb="2">
              🪑 Confirmados por Mesa (PDF)
            </Heading>
            <Text color="gray.500" fontSize="sm" mb="5">
              Lista dos convidados confirmados, agrupados e ordenados por mesa.
            </Text>
            <Button
              w="100%"
              variant="outline"
              colorPalette="blue"
              onClick={() => exportPDFData('tables')}
              size="lg"
              borderRadius="full"
            >
              <Download size={16} />
              Baixar por Mesas
            </Button>
          </Box>
        </Grid>
      </Box>
    </Box>
  )
}