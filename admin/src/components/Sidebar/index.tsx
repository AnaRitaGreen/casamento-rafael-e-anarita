import { Box, Flex, Icon } from '@chakra-ui/react'
import { Menu } from 'lucide-react'

import { useSidebar } from '@/contexts/SidebarContext'
import { useColorMode } from '@/components/ui/color-mode'
import { SidebarNav } from './SidebarNav'
import {
  DrawerRoot,
  DrawerContent,
  DrawerBody,
  DrawerCloseTrigger,
} from '@/components/ui/drawer'

export function Sidebar() {
  const { isOpen, onClose } = useSidebar()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  const sidebarContent = (
    <Flex
      direction="column"
      h="100%"
      py="4"
      px="3"
    >
      <SidebarNav />
    </Flex>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <Box
        as="aside"
        display={{ base: 'none', md: 'block' }}
        minW="240px"
        maxW="240px"
        bg={isDark ? 'gray.900' : 'white'}
        borderRightWidth="1px"
        borderColor={isDark ? 'whiteAlpha.100' : 'gray.200'}
        position="sticky"
        top="0"
        h="100vh"
        overflowY="auto"
      >
        {sidebarContent}
      </Box>

      {/* Mobile drawer */}
      <DrawerRoot
        open={isOpen}
        onOpenChange={(e) => { if (!e.open) onClose() }}
        placement="start"
      >
        <DrawerContent
          bg={isDark ? 'gray.900' : 'white'}
          maxW="280px"
        >
          <DrawerCloseTrigger />
          <DrawerBody p="0">
            {sidebarContent}
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>
    </>
  )
}

/** Mobile menu toggle button — use in the layout header */
export function SidebarToggle() {
  const { onOpen } = useSidebar()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  return (
    <Flex
      as="button"
      display={{ base: 'flex', md: 'none' }}
      align="center"
      justify="center"
      w="10"
      h="10"
      borderRadius="lg"
      bg="transparent"
      border="none"
      cursor="pointer"
      color={isDark ? 'white' : 'gray.700'}
      _hover={{ bg: isDark ? 'whiteAlpha.100' : 'gray.100' }}
      onClick={onOpen}
      aria-label="Abrir menu"
    >
      <Icon asChild boxSize="6">
        <Menu />
      </Icon>
    </Flex>
  )
}