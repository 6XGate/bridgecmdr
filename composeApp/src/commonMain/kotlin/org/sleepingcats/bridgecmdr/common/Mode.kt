package org.sleepingcats.bridgecmdr.common

val isProduction by lazy { System.getenv("BRIDGECMDR_MODE")?.lowercase() != "prod" }

val isDevelopment by lazy { System.getenv("BRIDGECMDR_MODE")?.lowercase() == "dev" }
