import { saleorApp } from "../src/saleor-app";
import { createServerClient } from "../src/lib/create-graphq-client";
import { getPaymentAppConfigurator } from "../src/modules/payment-app-configuration/payment-app-configuration-factory";

const SALEOR_API_URL = process.env.SALEOR_API_URL ?? "http://saleor-api.localhost:8000/graphql/";

async function main() {
  const [, , newSecret] = process.argv;

  if (!newSecret) {
    console.error("Usage: pnpm ts-node -r tsconfig-paths/register scripts/update-webhook-secret.ts <new_webhook_secret>");
    process.exit(1);
  }

  const authData = await saleorApp.apl.get(SALEOR_API_URL);
  if (!authData?.token) {
    throw new Error(`Missing auth data for ${SALEOR_API_URL}. Make sure the app is installed.`);
  }

  const client = createServerClient(SALEOR_API_URL, authData.token);
  const configurator = getPaymentAppConfigurator(client, SALEOR_API_URL);
  const config = await configurator.getConfig();

  const [entry] = config.configurations;
  if (!entry) {
    throw new Error("Stripe configuration entry not found. Configure the app first.");
  }

  await configurator.setConfigEntry({
    configurationId: entry.configurationId,
    configurationName: entry.configurationName,
    secretKey: entry.secretKey,
    publishableKey: entry.publishableKey,
    webhookId: entry.webhookId,
    webhookSecret: newSecret,
  });

  console.log(`Updated webhook secret for configuration ${entry.configurationId}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
