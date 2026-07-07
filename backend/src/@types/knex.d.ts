// eslint-disable-next-line
import { Knex } from "knex";

declare module 'knex/types/tables' {
  export interface Admin {
    id: string
    username: string
    password_hash: string
    created_at: Date
    updated_at: Date
  }

  export interface AdminsRefreshTokens {
    id: string
    admin_id: string
    token: string
    expires_at: Date
    created_at: Date
    updated_at: Date
  }

  export interface Groups {
    id: string
    name: string
    slug: string
    created_at: Date
    updated_at: Date
  }

  export interface Guests {
    id: string
    group_id: string
    name: string
    is_child: boolean
    confirmed: boolean
    confirmed_at: Date
    restriction: string
    created_at: Date
    updated_at: Date
  }

  export interface Gifts {
    id: string
    title: string
    description: string
    link: string
    image: string
    value: number
    reserved: boolean
    reserved_by: string
    reserved_at: Date
    created_at: Date
    updated_at: Date
  }

  export interface GroupMessages {
    id: string
    group_id: string
    message: string
    created_at: Date
    updated_at: Date
  }

  export interface Tables {
    admins: Admin
    admin_refresh_tokens: AdminsRefreshTokens
    groups: Groups
    guests: Guests
    gifts: Gifts
    group_messages: GroupMessages
  }
}