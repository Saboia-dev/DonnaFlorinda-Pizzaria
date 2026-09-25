CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`request_key` text NOT NULL,
	`ip_hash` text NOT NULL,
	`data` text NOT NULL,
	`total` integer NOT NULL,
	`demo` integer NOT NULL,
	`status` text NOT NULL,
	`payment` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_request_key_unique` ON `orders` (`request_key`);--> statement-breakpoint
CREATE INDEX `orders_owner_created` ON `orders` (`owner`,`created`);--> statement-breakpoint
CREATE INDEX `orders_ip_created` ON `orders` (`ip_hash`,`created`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL
);
