import { Card, Tab, TabList, type SelectTabData } from "@fluentui/react-components";
import {
  AppsListDetail24Regular,
  BookToolbox24Regular,
  DocumentText24Regular,
  Settings24Regular,
} from "@fluentui/react-icons";
import { useStyles } from "./useStyles";
import { useI18n } from "../tools/i18n";
import { AvatarPanel } from "./AvatarPanel/AvatarPanel";
import { BasicTab } from "./tabs/BasicTab";
import { DetailsTab } from "./tabs/DetailsTab";
import { CharacterBookTab } from "./tabs/CharacterBookTab";
import { AdvancedTab } from "./tabs/AdvancedTab";
import { useEditorStore } from "../store/editorStore";
import { createDefaultCardData } from "../lib/cardData";

export function EditorView() {
  const styles = useStyles();
  const t = useI18n();

  const selectedTab = useEditorStore((state) => state.selectedTab);
  const selectTab = useEditorStore((state) => state.selectTab);
  const formData = useEditorStore((state) => state.formData);
  const handleInputChange = useEditorStore((state) => state.setField);
  const handleBookDataChange = useEditorStore((state) => state.setBookData);

  return (
    <div className={styles.editorLayout}>
      <AvatarPanel />
      <Card className={styles.formTabsPanel}>
        <TabList
          selectedValue={selectedTab}
          onTabSelect={(_, data: SelectTabData) => selectTab(data.value as string)}
        >
          <Tab icon={<AppsListDetail24Regular />} value="basic">
            {t("Basic Info")}
          </Tab>
          <Tab icon={<DocumentText24Regular />} value="details">
            {t("Details")}
          </Tab>
          <Tab icon={<BookToolbox24Regular />} value="book">
            {t("Character Book")}
          </Tab>
          <Tab icon={<Settings24Regular />} value="advanced">
            {t("Advanced")}
          </Tab>
        </TabList>
        <div className={styles.tabContent}>
          {(() => {
            switch (selectedTab) {
              case "basic":
                return (
                  <BasicTab formData={formData} handleInputChange={handleInputChange} />
                );
              case "details":
                return (
                  <DetailsTab formData={formData} handleInputChange={handleInputChange} />
                );
              case "book":
                return (
                  <CharacterBookTab
                    bookData={
                      formData.character_book ?? createDefaultCardData().character_book!
                    }
                    onBookChange={handleBookDataChange}
                  />
                );
              case "advanced":
                return (
                  <AdvancedTab formData={formData} handleInputChange={handleInputChange} />
                );
              default:
                return <span>WARN: Tab Render Error [{selectedTab}]</span>;
            }
          })()}
        </div>
      </Card>
    </div>
  );
}
