import { useAppBridge, withAuthorization } from "@saleor/app-sdk/app-bridge";
import { Box, Text } from "@saleor/macaw-ui/next";
import { AppLayout, AppLayoutRow } from "@/modules/ui/templates/AppLayout";
import { trpcClient } from "@/modules/trpc/trpc-client";
import { getErrorHandler } from "@/modules/trpc/utils";
import { useFetchChannelsQuery } from "generated/graphql";
import { StripeConfigurationsList } from "@/modules/ui/organisms/StripeConfigurationList/StripeConfigurationList";
import { ChannelToConfigurationList } from "@/modules/ui/organisms/ChannelToConfigurationList/ChannelToConfigurationList";

function ListConfigurationPage() {
  const { appBridge } = useAppBridge();
  const [allConfigurations, channelMappings] = trpcClient.useQueries((t) => [
    t.paymentAppConfigurationRouter.paymentConfig.getAll(undefined, {
      onError: getErrorHandler({
        appBridge,
        actionId: "list-all-configurations",
        message: "Error while fetching the list of configurations",
        title: "API Error",
      }),
    }),
    t.paymentAppConfigurationRouter.mapping.getAll(undefined, {
      onError: getErrorHandler({
        appBridge,
        actionId: "channel-mappings-get-all",
        message: "Error while fetching the channel mappings",
        title: "API Error",
      }),
    }),
  ]);

  const [channels] = useFetchChannelsQuery();

  const hasAnyConfigs = allConfigurations.data && allConfigurations.data.length > 0;
  const hasAnyMappings = Object.values(channelMappings.data || {}).filter(Boolean).length > 0;

  if (allConfigurations.isLoading) {
    return (
      <AppLayout title="Stripe">
        <div />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Stripe">
      <AppLayoutRow
        title="Stripe Configurations"
        description="Create Stripe configurations that can be later assigned to Saleor channels."
      >
        <StripeConfigurationsList configurations={allConfigurations.data || []} />
      </AppLayoutRow>
      <AppLayoutRow
        disabled={!hasAnyConfigs}
        title="Saleor channel mappings"
        description={
          <Box>
            <Text as="p" variant="body" size="medium">
              Assign Stripe configurations to Saleor channels.
            </Text>
            {!hasAnyMappings && (
              <Box marginTop={6}>
                <Text as="p" variant="body" size="medium" color="textCriticalDefault">
                  No channels have configurations assigned.
                </Text>
                <Text as="p" variant="body" size="medium" color="textCriticalDefault">
                  This means payments are not processed by Stripe.
                </Text>
              </Box>
            )}
          </Box>
        }
      >
        <ChannelToConfigurationList
          disabled={!hasAnyConfigs || channelMappings.isLoading}
          configurations={allConfigurations.data || []}
          channelMappings={channelMappings.data || {}}
          channels={channels.data?.channels || []}
        />
      </AppLayoutRow>
    </AppLayout>
  );
}

export default withAuthorization()(ListConfigurationPage);