import { Action, ActionPanel, Detail, Icon, List, ListSection } from '@raycast/api';
import { useEffect, useState } from 'react';

import Service from './service';
import {
  getSheets,
  stripFrontmatter,
  stripTemplateTags,
  formatTables,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
} from './utils';

function Command() {
  const [sheets, setSheets] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchList() {
      const files = await Service.listFiles();
      let sheets = getSheets(files);
      const favorites = await getFavorites();
      sheets = sheets.filter((s) => !favorites.includes(s));
      setFavorites(favorites);
      setSheets(sheets);
      setLoading(false);
    }

    fetchList();
  }, []);

  return (
    <List isLoading={isLoading}>
      {favorites.length > 0 && (
      <List.Section title="Favorites">
        {favorites.map((sheet) => (
          <SheetItem sheet={sheet} isFavorite={true} />
        ))}
      </List.Section>
      )}
      <List.Section title="Cheatsheets">
        {sheets.map((sheet) => (
          <SheetItem sheet={sheet} isFavorite={false} />
        ))}
      </List.Section>
    </List>
  );
}

interface SheetProps {
  slug: string;
}

function SheetView(props: SheetProps) {
  const [sheet, setSheet] = useState('');
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSheet() {
      const sheetMarkdown = await Service.getSheet(props.slug);
      const sheet = formatTables(
        stripTemplateTags(stripFrontmatter(sheetMarkdown)),
      );

      setSheet(sheet);
      setLoading(false);
    }

    fetchSheet();
  }, []);

  return <Detail isLoading={isLoading} markdown={sheet} />;
}

interface SheetItemProps {
  sheet: string;
  isFavorite: boolean;
}

function SheetItem(props: SheetItemProps) {
  const { sheet, isFavorite} = props;

  return (
  <List.Item
  actions={
    <ActionPanel>
      <Action.Push
        title="Open Cheatsheet"
        icon={Icon.Window}
        target={<SheetView slug={sheet} />}
      />
      <Action.OpenInBrowser url={Service.urlFor(sheet)} />
      {isFavorite && <Action title="Remove from Favorites" onAction={async () => await removeFromFavorites(sheet)} />}
      {!isFavorite && <Action title="Add to Favorites" onAction={async () => await addToFavorites(sheet)} />}
    </ActionPanel>
  }
  key={sheet}
  title={sheet}
/>);
}

export default Command;
