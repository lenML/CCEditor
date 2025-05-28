import React, {
  useState,
  useEffect,
  useCallback,
  type SetStateAction,
  useRef,
} from "react";
import { CharacterCard, type SpecV3 } from "@lenml/char-card-reader";

import {
  FluentProvider,
  webDarkTheme,
  tokens,
  Button,
  Card,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Spinner,
  Text,
  Divider,
  Tooltip,
  TabList,
  Tab,
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
  type SelectTabData,
  Input,
} from "@fluentui/react-components";

import {
  Dismiss24Regular,
  History24Regular,
  AppsListDetail24Regular,
  DocumentText24Regular,
  BookToolbox24Regular,
  Settings24Regular,
} from "@fluentui/react-icons";
import { useStyles } from "./useStyles";
import { GITHUB_REPO_LINK, HISTORY_KEY, MAX_HISTORY_ITEMS } from "./constants";
import { GithubIcon } from "./icons";
import { CharacterBookTab } from "./tabs/CharacterBookTab";
import { useGlobalDrop } from "./useGlobalDrop";
import { useI18n } from "../tools/i18n";
import { BasicTab } from "./tabs/BasicTab";
import { DetailsTab } from "./tabs/DetailsTab";
import { AdvancedTab } from "./tabs/AdvancedTab";
import { formatDateData } from "../tools/times";
import { AvatarPanel } from "./AvatarPanel/AvatarPanel";
import { LangSwitch } from "./LangSwitch";
import { createBlackImage } from "../tools/images";
import { ToolTab } from "./tabs/ToolTab";
import { useGlobalPaste } from "./useGlobalPaste";
import { StartPanel } from "./StartPanel/StartPanel";
import pkgJson from "../../package.json";

function getDefaultFormData() {
  return {
    name: "",
    description: "",
    tags: [],
    creator: "",
    character_version: "",
    mes_example: "",
    system_prompt: "",
    post_history_instructions: "",
    first_mes: "",
    alternate_greetings: [],
    personality: "",
    scenario: "",
    creator_notes: "",
    nickname: "",
    source: [],
    group_only_greetings: [],
    character_book: { name: "", entries: [], extensions: {} },
    assets: [],
    extensions: {},
    creator_notes_multilingual: {},
    creation_date: undefined,
    modification_date: undefined,
  } as SpecV3.CharacterCardV3["data"];
}

export function App() {
  const styles = useStyles();
  const [characterCard, setCharacterCard] = useState<null | CharacterCard>(
    null
  ); // Stores the full CharacterCard instance
  const [formData, setFormData] = useState(getDefaultFormData());
  const [avatarPreview, setAvatarPreview] = useState<null | string>(null);
  const [originalFile, setOriginalFile] = useState<null | ArrayBuffer>(null);
  const [originalFileName, setOriginalFileName] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("basic");
  const [isDirty, setIsDirty] = useState(false);
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;

  const [showHistoryLoadConfirm, setShowHistoryLoadConfirm] = useState({
    open: false,
    index: -1,
  });

  useEffect(() => {
    const storedHistory = localStorage.getItem(HISTORY_KEY);
    if (storedHistory) setHistory(JSON.parse(storedHistory));
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const setFormDataFromCardData = (
    cardData: SpecV3.CharacterCardV3["data"]
  ) => {
    setFormData({
      name: cardData.name || "",
      description: cardData.description || "",
      tags: cardData.tags || [],
      creator: cardData.creator || "",
      character_version: cardData.character_version || "",
      mes_example: cardData.mes_example || "",
      system_prompt: cardData.system_prompt || "",
      post_history_instructions: cardData.post_history_instructions || "",
      first_mes: cardData.first_mes || "",
      alternate_greetings: cardData.alternate_greetings || [],
      personality: cardData.personality || "",
      scenario: cardData.scenario || "",
      creator_notes: cardData.creator_notes || "",
      nickname: cardData.nickname || "",
      source: cardData.source || [],
      group_only_greetings: cardData.group_only_greetings || [],
      // Character book is parsed into an object
      character_book: cardData.character_book
        ? typeof cardData.character_book === "string"
          ? JSON.parse(cardData.character_book)
          : cardData.character_book
        : { name: "", entries: [] },
      // Other complex fields are kept as strings for raw JSON textareas
      assets: cardData.assets || [],
      extensions: cardData.extensions || {},
      creator_notes_multilingual: cardData.creator_notes_multilingual || {},
      creation_date: formatDateData(
        cardData.creation_date ?? new Date()
      ).getTime(),
      modification_date: formatDateData(
        cardData.modification_date ?? new Date()
      ).getTime(),
    });
  };

  const resetEditorState = () => {
    setCharacterCard(null);
    setFormData(getDefaultFormData());
    setAvatarPreview(null);
    setOriginalFile(null);
    setOriginalFileName("");
    setIsDirty(false);
    setSelectedTab("basic");
    if (document.getElementById("fileInput"))
      // @ts-ignore
      document.getElementById("fileInput").value = "";
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleBookDataChange = (newBookData: any) => {
    setFormData((prev: any) => ({ ...prev, character_book: newBookData }));
    setIsDirty(true);
  };

  const getFinalCard = () => {
    if (
      !characterCard &&
      !Object.values(formData).some(
        (val) =>
          (typeof val === "string" && val.trim() !== "") ||
          (typeof val === "object" &&
            val !== null &&
            (Array.isArray(val)
              ? val.length > 0
              : Object.keys(val).length > 0)) ||
          typeof val === "number"
      )
    ) {
      alert("No data to save. Load a card or enter data first.");
      return;
    }

    const dataToSave = { ...formData };
    const nowTimestamp = Math.floor(Date.now() / 1000);

    // Preserve original creation date if available, otherwise use current or form's date
    let creationTimestamp: any =
      characterCard?.toSpecV3().data.creation_date ??
      formData.creation_date ??
      nowTimestamp;
    dataToSave.creation_date = creationTimestamp;
    dataToSave.modification_date = nowTimestamp;
    creationTimestamp = formatDateData(creationTimestamp).getTime();

    return CharacterCard.from_json(
      {
        spec: "chara_card_v3",
        spec_version: "3.0",
        data: dataToSave,
      },
      avatarPreview || undefined
    );
  };

  const addToHistory = (
    cardData: SpecV3.CharacterCardV3["data"],
    avatarUrl: string | null,
    spec: string,
    spec_version: string
  ) => {
    if (!cardData || !cardData.name) return;
    setHistory((prevHistory) => {
      const newHistory = prevHistory.filter(
        (item) =>
          !(
            item.data.name === cardData.name &&
            item.data.first_mes === cardData.first_mes
          )
      );
      const newEntry = {
        data: JSON.parse(JSON.stringify(cardData)), // Deep copy
        avatar: avatarUrl,
        timestamp: new Date().toISOString(),
        spec: spec || "chara_card_v3", // Store spec info
        spec_version: spec_version || "3.0",
      };
      const updatedHistory = [newEntry, ...newHistory].slice(
        0,
        MAX_HISTORY_ITEMS
      );
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      } catch (error) {
        if (error instanceof Error && error.name === "QuotaExceededError") {
          alert(
            "Local storage quota exceeded. Some history items may be lost."
          );
          return prevHistory;
        } else {
          throw error;
        }
      }
      return updatedHistory;
    });
  };

  const handleLoadFromHistory = (index: number) => {
    if (isDirty) setShowHistoryLoadConfirm({ open: true, index });
    else confirmLoadFromHistory(index);
  };

  const confirmLoadFromHistory = (index: number) => {
    const item = history[index];
    if (item) {
      const mockCard = new CharacterCard(item); // For spec/version info
      setCharacterCard(mockCard);

      setFormDataFromCardData(item.data);
      setAvatarPreview(item.avatar || null);
      setOriginalFile(null);
      setOriginalFileName(
        `Loaded from history: ${item.data.name || "Unnamed"}`
      );
      setIsDirty(false);
      setSelectedTab("basic"); // Reset to basic tab on load
      setIsHistoryDrawerOpen(false); // Close drawer after loading
    }
    setShowHistoryLoadConfirm({ open: false, index: -1 });
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear all history?")) {
      setHistory([]);
      localStorage.removeItem(HISTORY_KEY);
    }
  };

  const onTabSelect = (event: any, data: SelectTabData) => {
    setSelectedTab(data.value as any);
  };

  async function createNewCharacter() {
    const tempAvatar = createBlackImage("CCEditor Avatar");
    const avatar_url = tempAvatar.toDataURL();
    const card = CharacterCard.from_json(
      {
        spec: "chara_card_v2",
        spec_version: "3.0",
        data: {
          name: "Alice",
          description: "Alice is a character",
          first_mes: "Hello",
        },
      },
      avatar_url
    );
    const blob = await new Promise<Blob | null>((resolve) => {
      tempAvatar.toBlob((blob) => {
        resolve(blob);
      });
    });
    if (!blob) throw new Error("Failed to create blob");
    const file = new File([blob], "avatar.png", {
      type: "image/png",
    });
    setCharacterCard(card);
    setFormDataFromCardData(card.toSpecV3().data);
    setAvatarPreview(avatar_url);
    setOriginalFile(await blob.arrayBuffer());
    setOriginalFileName("avatar.png");
    setIsDirty(false);
    setSelectedTab("basic");
  }

  const t = useI18n();

  return (
    <FluentProvider
      theme={webDarkTheme}
      className={styles.root}
      style={{
        height: "100vh",
      }}
    >
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          {/* Replace with actual logo if available */}
          <Text weight="bold" size={500}>
            🎭
          </Text>
          <Text className={styles.appName}>
            CC Editor <small>v{pkgJson.version}</small>
          </Text>
        </div>
        <div className={styles.headerRight}>
          <LangSwitch />
          <Tooltip content={t("View History")} relationship="label">
            <Button
              icon={<History24Regular />}
              appearance="transparent"
              onClick={() => setIsHistoryDrawerOpen(true)}
            >
              {t("History")}
            </Button>
          </Tooltip>
          <Tooltip content={t("View on GitHub")} relationship="label">
            <Button
              as="a"
              href={GITHUB_REPO_LINK}
              target="_blank"
              rel="noopener noreferrer"
              icon={<GithubIcon />}
              appearance="transparent"
              aria-label="GitHub Repository"
            />
          </Tooltip>
        </div>
      </header>

      {/* History Drawer */}
      <Drawer
        type="overlay" // or "inline"
        separator
        open={isHistoryDrawerOpen}
        onOpenChange={(_: any, { open }: any) => setIsHistoryDrawerOpen(open)}
        position="end"
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                aria-label="Close"
                icon={<Dismiss24Regular />}
                onClick={() => setIsHistoryDrawerOpen(false)}
              />
            }
          >
            {t("Card History")}
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody className={styles.historyDrawerBody}>
          {history.length > 0 ? (
            <>
              {history.map((item, index) => (
                <div
                  key={index}
                  className={styles.historyItem}
                  onClick={() => handleLoadFromHistory(index)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      handleLoadFromHistory(index);
                  }}
                >
                  <Text className={styles.historyItemName}>
                    {item.data.name || t("Unnamed Card")}
                  </Text>
                  <Text className={styles.historyItemDate}>
                    {new Date(item.timestamp).toLocaleDateString()}
                  </Text>
                </div>
              ))}
              <Divider style={{ margin: `${tokens.spacingVerticalM} 0` }} />
              <Button
                appearance="outline"
                onClick={handleClearHistory}
                style={{ alignSelf: "center" }}
              >
                {t("Clear All History")}
              </Button>
            </>
          ) : (
            <Text style={{ textAlign: "center" }}>{t("No history yet.")}</Text>
          )}
        </DrawerBody>
      </Drawer>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {characterCard ? null : (
          <StartPanel
            createNewCharacter={createNewCharacter}
            setOriginalFileName={setOriginalFileName}
            setOriginalFile={setOriginalFile}
            setCharacterCard={setCharacterCard}
            setFormDataFromCardData={setFormDataFromCardData}
            setAvatarPreview={setAvatarPreview}
            setIsDirty={setIsDirty}
            addToHistory={addToHistory}
            resetEditorState={resetEditorState}
            isDirtyRef={isDirtyRef}
          />
        )}

        <div
          className={styles.editorLayout}
          style={{
            display: !characterCard ? "none" : undefined,
          }}
        >
          {/* Left Panel: Avatar & Downloads */}
          <AvatarPanel
            avatarPreview={avatarPreview}
            originalFileName={originalFileName}
            getCurrentCard={getFinalCard}
            setFormData={setFormData}
            setIsDirty={setIsDirty}
            addToHistory={addToHistory}
            resetEditorState={resetEditorState}
            setAvatarPreview={setAvatarPreview}
            formData={formData}
            isDirty={isDirty}
          />

          {/* Right Panel: Form with Tabs */}
          <Card className={styles.formTabsPanel}>
            <TabList selectedValue={selectedTab} onTabSelect={onTabSelect}>
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

              <Divider vertical style={{ height: "100%", flex: 0 }}></Divider>
              <Tab icon={<Settings24Regular />} value="tool">
                {t("Tool")}
              </Tab>
            </TabList>
            <div className={styles.tabContent}>
              {(() => {
                switch (selectedTab) {
                  case "basic": {
                    return (
                      <BasicTab
                        formData={formData}
                        handleInputChange={handleInputChange}
                      />
                    );
                  }
                  case "details": {
                    return (
                      <DetailsTab
                        formData={formData}
                        handleInputChange={handleInputChange}
                      />
                    );
                  }
                  case "book": {
                    return (
                      <CharacterBookTab
                        bookData={
                          formData.character_book || {
                            name: "",
                            entries: [],
                            extensions: {},
                          }
                        }
                        onBookChange={handleBookDataChange}
                      />
                    );
                  }
                  case "advanced": {
                    return (
                      <AdvancedTab
                        formData={formData}
                        handleInputChange={handleInputChange}
                      />
                    );
                  }
                  case "tool": {
                    return <ToolTab getCard={getFinalCard} />;
                  }
                  default: {
                    return <span>WARN: Tab Render Error [{selectedTab}]</span>;
                  }
                }
              })()}
            </div>
          </Card>
        </div>
      </main>

      <Dialog
        open={showHistoryLoadConfirm.open}
        onOpenChange={(_: any, data: { open: any }) =>
          setShowHistoryLoadConfirm((prev) => ({ ...prev, open: data.open }))
        }
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{t("Unsaved Changes")}</DialogTitle>
            <DialogContent>
              {t(
                "You have unsaved changes. Are you sure you want to load from history? This will discard current changes."
              )}
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button
                  appearance="secondary"
                  onClick={() =>
                    setShowHistoryLoadConfirm({ open: false, index: -1 })
                  }
                >
                  {t("Cancel")}
                </Button>
              </DialogTrigger>
              <Button
                appearance="primary"
                onClick={() =>
                  confirmLoadFromHistory(showHistoryLoadConfirm.index)
                }
              >
                {t("Load from History")}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </FluentProvider>
  );
}
