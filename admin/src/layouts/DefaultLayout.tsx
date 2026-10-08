import { Outlet } from 'react-router-dom'
import { Flex } from '@chakra-ui/react'
import { Sidebar, SidebarToggle } from '@/components/Sidebar'
import { SidebarProvider } from '@/contexts/SidebarContext'
import { ColorModeButton } from '@/components/ui/color-mode'
import { useColorMode } from '@/components/ui/color-mode'

function LayoutInner() {
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  return (
    <Flex h="100vh" overflow="hidden">
      <Sidebar />
      <Flex direction="column" flex="1" minW="0">
        {/* Mobile top bar */}
        <Flex
          display={{ base: 'flex', md: 'none' }}
          align="center"
          justify="space-between"
          px="4"
          py="3"
          borderBottomWidth="1px"
          borderColor={isDark ? 'whiteAlpha.100' : 'gray.200'}
          bg={isDark ? 'gray.900' : 'white'}
        >
          <SidebarToggle />
          <ColorModeButton />
        </Flex>

        {/* Desktop color mode toggle */}
        <Flex
          display={{ base: 'none', md: 'flex' }}
          justify="flex-end"
          px="6"
          pt="4"
        >
          <ColorModeButton />
        </Flex>

        {/* Main content */}
        <Flex
          direction="column"
          flex="1"
          p={{ base: '4', md: '6' }}
          gap="4"
          overflowX="auto"
          overflowY="auto"
        >
          <Outlet />
        </Flex>
      </Flex>
    </Flex>
  )
}

export function DefaultLayout() {
  return (
    <SidebarProvider>
      <LayoutInner />
    </SidebarProvider>
  )
}