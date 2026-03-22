import { getSettingsPageData } from "@/module/settings";
import SettingsPageClient from "@/module/settings/settings-client";

export default async function Page () {
  const data = await getSettingsPageData();

  return <SettingsPageClient initialData={data} />;
};
