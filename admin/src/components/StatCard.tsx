import { Box, Text } from "@chakra-ui/react"

interface StatCardProps {
  value: number | string
  label: string
  gradient: string
}

export function StatCard({ value, label, gradient }: StatCardProps) {
  return (
    <Box
      p="6"
      borderRadius="2xl"
      boxShadow="lg"
      bgGradient={gradient}
      color="white"
    >
      <Text fontSize="4xl" fontWeight="800" lineHeight="1" mb="1">
        {value}
      </Text>
      <Text fontSize="sm" opacity={0.9} fontWeight="600">
        {label}
      </Text>
    </Box>
  )
}