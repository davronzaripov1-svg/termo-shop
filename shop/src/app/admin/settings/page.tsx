import { SettingsTabs } from "@/components/admin/settings/SettingsTabs"
import { TOKEN_MASK, getNotificationSettings, getShopSettings, getSiteSettings } from "@/lib/settings"

export const metadata = { title: "Настройки" }

export default async function SettingsPage() {
  const [site, shop, notifications] = await Promise.all([getSiteSettings(), getShopSettings(), getNotificationSettings()])

  return (
    <SettingsTabs
      site={site}
      shop={shop}
      notifications={{
        ...notifications,
        // сам токен в браузер не отдаём
        telegramBotToken: notifications.telegramBotToken ? TOKEN_MASK : "",
      }}
    />
  )
}
