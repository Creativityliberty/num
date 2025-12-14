import type { LoadedYamlFile } from "./loader.js";
import type { UniversalMode } from "./schemas.js";
/**
 * Normalise tes YAML Roo-like (slug/name/category/subcategory/roleDefinition/customInstructions)
 * vers un format universel.
 *
 * Exemple réel côté repo source:
 *  slug, name, category, subcategory, roleDefinition, customInstructions
 */
export declare function normalizeMode(file: LoadedYamlFile): UniversalMode | null;
