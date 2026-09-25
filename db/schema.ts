import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const products=sqliteTable('products',{id:text('id').primaryKey(),data:text('data').notNull()});
export const settings=sqliteTable('settings',{id:text('id').primaryKey(),data:text('data').notNull()});
export const orders=sqliteTable('orders',{id:text('id').primaryKey(),owner:text('owner').notNull(),requestKey:text('request_key').notNull().unique(),ipHash:text('ip_hash').notNull(),data:text('data').notNull(),total:integer('total').notNull(),demo:integer('demo').notNull(),status:text('status').notNull(),payment:text('payment').notNull(),created:integer('created').notNull()},t=>[index('orders_owner_created').on(t.owner,t.created),index('orders_ip_created').on(t.ipHash,t.created)]);
