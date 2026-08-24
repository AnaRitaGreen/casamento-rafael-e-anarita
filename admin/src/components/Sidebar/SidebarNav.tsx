import { Box, Flex, Icon, Text } from '@chakra-ui/react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  MessageCircleHeart,
  Gift,
  Grid,
  LogOut,
} from 'lucide-react'
import { adminLogout } from '@/services/adminService'
import { useColorMode } from '@/components/ui/color-mode'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/convidados', icon: Users, label: 'Convidados' },
  { to: '/grupos', icon: FolderOpen, label: 'Grupos' },
  { to: '/mensagens', icon: MessageCircleHeart, label: 'Mensagens' },
  { to: '/presentes', icon: Gift, label: 'Presentes' },
  { to: '/mesas', icon: Grid, label: 'Mesas' },
]

export function SidebarNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { colorMode } = useColorMode()

  const handleLogout = async () => {
    try {
      await adminLogout()
    } catch (e) {
      console.error(e)
    }
    navigate('/login')
  }

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return pathname === to
    return pathname.startsWith(to)
  }

  const isDark = colorMode === 'dark'

  return (
    <Flex direction="column" gap="1" flex="1">
      <Box mb="6" px="3" pt="2">
        <Text
          fontSize="xl"
          fontWeight="800"
          letterSpacing="-0.02em"
          color={isDark ? 'white' : 'purple.700'}
        >
          R & A
        </Text>
        <Text
          fontSize="xs"
          fontWeight="500"
          textTransform="uppercase"
          letterSpacing="0.12em"
          color={isDark ? 'whiteAlpha.600' : 'gray.500'}
        >
          Painel dos Noivos
        </Text>
      </Box>

      <Flex direction="column" gap="0.5" flex="1">
        {navItems.map((item) => {
          const active = isActive(item.to, item.exact)
          return (
            <NavLink key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
              <Flex
                align="center"
                gap="3"
                px="3"
                py="2.5"
                borderRadius="lg"
                fontWeight="600"
                fontSize="sm"
                transition="all 0.2s"
                bg={active ? (isDark ? 'whiteAlpha.150' : 'purple.50') : 'transparent'}
                color={
                  active
                    ? isDark
                      ? 'white'
                      : 'purple.700'
                    : isDark
                      ? 'whiteAlpha.700'
                      : 'gray.600'
                }
                _hover={{
                  bg: active
                    ? undefined
                    : isDark
                      ? 'whiteAlpha.100'
                      : 'gray.100',
                  color: isDark ? 'white' : 'purple.700',
                }}
              >
                <Icon asChild boxSize="5">
                  <item.icon />
                </Icon>
                <Text>{item.label}</Text>
              </Flex>
            </NavLink>
          )
        })}
      </Flex>

      <Box
        borderTopWidth="1px"
        borderColor={isDark ? 'whiteAlpha.200' : 'gray.200'}
        pt="3"
        mt="2"
      >
        <Flex
          as="button"
          align="center"
          gap="3"
          px="3"
          py="2.5"
          borderRadius="lg"
          fontWeight="600"
          fontSize="sm"
          w="100%"
          transition="all 0.2s"
          color={isDark ? 'red.300' : 'red.500'}
          _hover={{
            bg: isDark ? 'whiteAlpha.100' : 'red.50',
          }}
          onClick={handleLogout}
          cursor="pointer"
          bg="transparent"
          border="none"
        >
          <Icon asChild boxSize="5">
            <LogOut />
          </Icon>
          <Text>Sair</Text>
        </Flex>
      </Box>
    </Flex>
  )
}