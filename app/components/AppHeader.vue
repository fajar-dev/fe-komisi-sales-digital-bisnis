<template>
    <UHeader
        :toggle="false"
        :ui="{
        container: 'sm:px-14!',
        right: 'justify-end-safe overflow-x-auto py-2'
        }"
    >
        <template #left>
        <NuxtLink to="/">
            <img class="h-10" src="/logo.png" alt="Logo" />
        </NuxtLink>
        </template>

        <template #right>
        <div
            role="group"
            class="flex items-center gap-0.5"
        >

            <UColorModeButton size="sm" />
            <ClientOnly>
                <UDropdownMenu
                    :items="items"
                    size="sm"
                    :content="{
                    align: 'start',
                    side: 'bottom',
                    sideOffset: 8
                    }"
                    :ui="{
                    content: 'w-48'
                    }"
                >
                    <UUser
                    size="sm"
                    name="John Doe"
                    description="johndoe@example.com"
                    class="pl-2"
                    :avatar="{
                        src: '/avatar.png',
                    }"
                    :ui="{
                        name: 'hidden sm:block',
                        description: 'hidden sm:block'
                    }"
                    />
                </UDropdownMenu>
            </ClientOnly>
        </div>
        </template>
    </UHeader>
</template>

<script setup lang="ts">
    import type { DropdownMenuItem } from '@nuxt/ui'

    const toast = useToast()

    const handleLogout = async () => {
        toast.add({ title: 'Logged out successfully' })
        navigateTo('/sign-in')
    }

    const items = computed<DropdownMenuItem[]>(() => [
        {
        label: 'Sign Out',
        icon: 'i-lucide-log-out',
        onSelect: handleLogout
        },
    ])
</script>