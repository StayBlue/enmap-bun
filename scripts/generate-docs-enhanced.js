/**
 * Enhanced documentation generation script with TypeScript type support
 *
 * This script provides options for:
 * 1. TypeDoc HTML generation (best TypeScript types)
 * 2. JSDoc-to-Markdown generation (for existing workflow)
 * 3. Both formats for comparison
 */

import { execSync } from 'child_process';
import jsdoc2md from 'jsdoc-to-markdown';
import { writeFile, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const apiDocsHeader = `---
description: >-
  The complete and unadultered API documentation for every single method and
  property accessible in Enmap.
---

# Full Documentation

The following is the complete list of methods available in Enmap. As it is auto-generated from the source code and its comments, it's a little more "raw" than the Usage docs. However, it has the benefit of being more complete and usually more up to date than the manually written docs.

{% hint style="warning" %}
If you're doing a PR on the docs github, please do not manually edit the below contents, as it will be overwritten. Check the src/index.ts source code and change the comments there instead!
{% endhint %}

<a name="enmap"></a>

## Enmap Class

The Enmap class provides a simple, synchronous, fast key/value storage built around bun:sqlite.
Contains extra utility methods for managing arrays and objects.

`;

/**
 * Post-processes TypeDoc-generated markdown files to fix angle bracket issues for Retype
 * This prevents Retype's JavaScript from interpreting TypeScript generics as invalid HTML tags
 */
async function fixMarkdownForRetype(docsPath) {
  const fixFile = async (filePath) => {
    try {
      const content = await readFile(filePath, 'utf-8');

      // Fix problematic patterns that cause Retype to interpret generics as HTML tags
      let fixedContent = content
        // Fix headings with generics: "# Class: default\<V, SV\>" -> "# Class: default (V, SV)"
        .replace(/^(#+\s+.*?)\\<([^>]+)\\>/gm, '$1 ($2)')
        // Fix method signatures: "**new default**\<`V`, `SV`\>" -> "**new default** (V, SV)"
        .replace(/(\*\*[^*]+\*\*)\\<([^>]+)\\>/g, '$1 ($2)')
        // Fix inline generics in code: "`Enmap`\<`V`, `SV`\>" -> "`Enmap<V, SV>`"
        .replace(/(`[^`]+`)\\<([^>]+)\\>/g, '$1<$2>')
        // Fix link references: "[`EnmapOptions`](../interfaces/EnmapOptions.md)\<`V`, `SV`\>" -> "[`EnmapOptions`](../interfaces/EnmapOptions.md)<V, SV>"
        .replace(/(\[[^\]]+\]\([^)]+\))\\<([^>]+)\\>/g, '$1<$2>');

      // Also handle any remaining HTML entities that might cause issues
      fixedContent = fixedContent
        // Convert problematic HTML entities in headings back to parentheses format
        .replace(/^(#+\s+.*?)&lt;([^&]+)&gt;/gm, '$1 ($2)')
        // But keep them in code blocks and inline code
        .replace(/(`[^`]*?)&lt;([^&]*?)&gt;([^`]*?`)/g, '$1<$2>$3');

      if (content !== fixedContent) {
        await writeFile(filePath, fixedContent);
      }
    } catch (error) {
      console.warn(`⚠️  Could not fix ${filePath}:`, error.message);
    }
  };

  const processDirectory = async (dirPath) => {
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        if (entry.isDirectory()) {
          await processDirectory(fullPath);
        } else if (entry.name.endsWith('.md')) {
          await fixFile(fullPath);
        }
      }
    } catch (error) {
      console.warn(
        `⚠️  Could not process directory ${dirPath}:`,
        error.message,
      );
    }
  };

  await processDirectory(docsPath);
}

async function generateJSDocMarkdown() {
  console.log('📚 Generating JSDoc-to-Markdown documentation...');

  // Compile TypeScript first
  console.log('📦 Compiling TypeScript...');
  execSync('bun run build', { stdio: 'inherit' });

  // Generate JSDoc markdown
  const rendered = await jsdoc2md.render({
    files: './dist/index.js',
  });

  if (!rendered || rendered.trim().length === 0) {
    console.warn('⚠️  Warning: JSDoc generated empty output.');
    return '';
  }

  // Process and format the documentation
  const processedOutput = rendered
    .replace(/## Members/g, '## Properties')
    .replace(/## Functions/g, '## Methods')
    .replace(
      /\*\*Kind\*\*: global function/g,
      '**Kind**: instance method of <code>Enmap</code>',
    )
    .replace(
      /\*\*Kind\*\*: global variable/g,
      '**Kind**: instance property of <code>Enmap</code>',
    )
    .replace(/\n{3,}/g, '\n\n');

  const finalOutput = apiDocsHeader + processedOutput;
  await writeFile('./docs/api.md', finalOutput, 'utf8');

  console.log('✅ JSDoc-to-Markdown documentation saved to ./docs/api.md');
  return finalOutput;
}

async function generateTypeDoc() {
  console.log('🔷 Generating TypeDoc HTML documentation...');

  try {
    execSync('npx typedoc --out ./docs-typedoc --plugin default', {
      stdio: 'inherit',
    });
    console.log('✅ TypeDoc HTML documentation saved to ./docs-typedoc/');
    return true;
  } catch (error) {
    console.error('❌ TypeDoc HTML generation failed:', error.message);
    return false;
  }
}

async function generateTypeDocMarkdown() {
  console.log('📝 Generating TypeDoc Markdown for Retype...');

  try {
    execSync('npx typedoc', { stdio: 'inherit' });

    // Post-process the generated markdown files to fix angle bracket issues
    await fixMarkdownForRetype('./docs/typedoc');

    // Create the README.md file for the typedoc folder
    const retypeReadmeContent = `---
icon: code
expanded: true
order: 90
---

# API Reference

Complete TypeScript API documentation for Enmap with full type information.

:::hint{type="info"}
This documentation is automatically generated from the TypeScript source code and includes complete type signatures, generics, and cross-references.
:::

## Quick Navigation

### Core Classes
- **[Enmap Class](classes/default.md)** - Main database class with all methods

### Interfaces  
- **[EnmapOptions](interfaces/EnmapOptions.md)** - Configuration options for Enmap

---

## Key Features

### TypeScript Support
- **Full type safety** with generics \`Enmap<V, SV>\`
- **Custom types** like \`Path<T>\` for nested object access
- **Precise return types** and parameter validation

### Method Categories

#### Core Operations
- \`set()\`, \`get()\`, \`has()\`, \`delete()\`, \`clear()\`
- Type-safe with optional path parameters

#### Array Operations  
- \`push()\`, \`includes()\`, \`remove()\` 
- Full array method equivalents: \`map()\`, \`filter()\`, \`find()\`, etc.

#### Mathematical Operations
- \`math()\`, \`inc()\`, \`dec()\`
- Type-constrained to numeric values

#### Advanced Features
- \`observe()\` - Reactive objects that auto-save
- \`ensure()\` - Type-safe default value assignment  
- \`update()\` - React-style object merging

---

:::tip{type="success"}
The TypeScript API documentation includes live examples, full method signatures, and links to source code for every feature.
:::
`;

    // Write the README.md into the typedoc folder
    await writeFile('./docs/typedoc/README.md', retypeReadmeContent);

    console.log('✅ TypeDoc Markdown documentation saved to ./docs/typedoc/');
    console.log('✅ Retype README.md created at ./docs/typedoc/README.md');
    console.log(
      '✅ Fixed angle brackets in markdown files for Retype compatibility',
    );
    return true;
  } catch (error) {
    console.error('❌ TypeDoc Markdown generation failed:', error.message);
    return false;
  }
}

async function generateAllFormats() {
  console.log('🔄 Generating all documentation formats...\n');

  const [markdownOutput, typedocSuccess, retypeSuccess] = await Promise.all([
    generateJSDocMarkdown(),
    generateTypeDoc(),
    generateTypeDocMarkdown(),
  ]);

  console.log('\n📊 Documentation Generation Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (markdownOutput) {
    const methodCount = (markdownOutput.match(/## \w+\(/g) || []).length;
    const propertyCount = (markdownOutput.match(/⇒ <code>\w+<\/code>/g) || [])
      .length;

    console.log('📄 JSDoc-to-Markdown:');
    console.log(`   • Output: ./docs/api.md`);
    console.log(`   • Content: ${markdownOutput.length} characters`);
    console.log(`   • Methods: ${methodCount}`);
    console.log(`   • Properties: ${propertyCount}`);
    console.log(`   • Use: bun run docs:markdown`);
  }

  if (typedocSuccess) {
    console.log('\n🔷 TypeDoc HTML:');
    console.log(`   • Output: ./docs-typedoc/`);
    console.log(`   • Features: Rich HTML interface with search`);
    console.log(`   • Types: Full TypeScript type information`);
    console.log(`   • Use: bun run docs:typedoc`);
    console.log(`   • View: Open ./docs-typedoc/index.html in browser`);
  }

  if (retypeSuccess) {
    console.log('\n📖 Retype Integration:');
    console.log(`   • Output: ./docs/typedoc/ (markdown)`);
    console.log(`   • Features: TypeScript types + Retype styling`);
    console.log(`   • Integration: ./docs/typedoc/README.md`);
    console.log(`   • Use: bun run docs:retype`);
    console.log(`   • View: Your existing Retype documentation site`);
  }

  console.log('\n💡 Recommendations:');
  console.log(
    '   • Use Retype integration for your main docs (best of both worlds!)',
  );
  console.log('   • Use TypeDoc HTML for development/API reference');
  console.log('   • JSDoc Markdown as fallback for existing workflows');
}

// Parse command line arguments
const args = process.argv.slice(2);
const format = args[0];

async function main() {
  try {
    switch (format) {
      case 'markdown':
      case 'jsdoc':
        await generateJSDocMarkdown();
        break;
      case 'typedoc':
      case 'html':
        await generateTypeDoc();
        break;
      case 'retype':
        await generateTypeDocMarkdown();
        break;
      case 'all':
      case 'both':
      case undefined:
        await generateAllFormats();
        break;
      default:
        console.log('Usage: node generate-docs-enhanced.js [format]');
        console.log('Formats: markdown, typedoc, retype, all (default)');
        console.log('');
        console.log('Examples:');
        console.log(
          '  node generate-docs-enhanced.js markdown  # JSDoc markdown only',
        );
        console.log(
          '  node generate-docs-enhanced.js typedoc   # TypeDoc HTML only',
        );
        console.log(
          '  node generate-docs-enhanced.js retype    # TypeDoc markdown for Retype',
        );
        console.log('  node generate-docs-enhanced.js all       # All formats');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Documentation generation failed:', error.message);
    process.exit(1);
  }
}

main();
