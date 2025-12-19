import { File, Directory, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { closeDatabase } from './database';

const DATABASE_NAME = 'snacktrack.db';

/**
 * Utility to backup the current SQLite database to external storage.
 * Uses the modern Expo SDK 54 FileSystem API.
 */
export const backupDatabase = async () => {
    try {
        // expo-sqlite stores databases in the document directory / SQLite folder
        const sqliteDir = new Directory(Paths.document, 'SQLite');
        const dbFile = new File(sqliteDir, DATABASE_NAME);

        // Check availability using the new File object
        if (!dbFile.exists) {
            throw new Error('Database file not found at ' + dbFile.uri);
        }

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(dbFile.uri, {
                UTI: 'public.database', // iOS standard for DB files
                mimeType: 'application/x-sqlite3', // Android standard
                dialogTitle: 'Export SnackTrack Backup',
            });
            return true;
        } else {
            throw new Error('Sharing is not available on this platform');
        }
    } catch (error) {
        console.error('Backup failed:', error);
        throw error;
    }
};

/**
 * Utility to restore a database file from a local picker.
 * Overwrites the current database and refreshes connections.
 */
export const restoreDatabase = async () => {
    try {
        // 1. Pick the backup file
        const result = await DocumentPicker.getDocumentAsync({
            type: '*/*',
            copyToCacheDirectory: true,
        });

        if (result.canceled) return false;

        const selectedAsset = result.assets[0];
        const sourceFile = new File(selectedAsset.uri);

        // 2. Prepare target directory
        const sqliteDir = new Directory(Paths.document, 'SQLite');
        if (!sqliteDir.exists) {
            sqliteDir.create();
        }

        const targetFile = new File(sqliteDir, DATABASE_NAME);

        // 3. Close current database to prevent locks
        await closeDatabase();

        // 4. Copy the new file over the old one
        // Modern SDK 54 copy method
        await sourceFile.copy(targetFile);

        return true;
    } catch (error) {
        console.error('Restore failed:', error);
        throw error;
    }
};
