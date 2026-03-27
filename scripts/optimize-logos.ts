import sharp from 'sharp';
import { readdir, rename, unlink } from 'fs/promises';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, extname, basename } from 'path';

const LOGOS_DIR = join(process.cwd(), 'public/logos');
const CONFIG_PATH = join(process.cwd(), 'src/data/config.yml');
const WEBP_QUALITY = 88;
const SKIP = ['tesdash.webp', 'tesdash-black.webp', 'tesflix.webp', 'tesflix.png', 'SkyShowtime_logo.webp'];

const files = await readdir(LOGOS_DIR);
const toProcess = files.filter(f => {
	const ext = extname(f).toLowerCase();
	return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext) && !SKIP.includes(f);
});

let configContent = readFileSync(CONFIG_PATH, 'utf-8');
let configChanged = false;

console.log(`Processing ${toProcess.length} images...\n`);

for (const file of toProcess) {
	const inputPath = join(LOGOS_DIR, file);
	const ext = extname(file).toLowerCase();
	const nameWithoutExt = basename(file, ext);
	const outputName = `${nameWithoutExt}.webp`;
	const outputPath = join(LOGOS_DIR, outputName);

	const pipeline = sharp(inputPath).resize(160, 160, { fit: 'inside', withoutEnlargement: true }).webp({ quality: WEBP_QUALITY, effort: 6 });

	if (ext === '.webp') {
		const tmpPath = outputPath + '.tmp.webp';
		await pipeline.toFile(tmpPath);
		await unlink(inputPath);
		await rename(tmpPath, outputPath);
		console.log(`✓ ${file} → ${outputName} (re-encoded)`);
	} else {
		await pipeline.toFile(outputPath);
		await unlink(inputPath);
		console.log(`✓ ${file} → ${outputName}`);
	}

	// Update config.yml references
	const oldRef = `/logos/${file}`;
	const newRef = `/logos/${outputName}`;
	if (oldRef !== newRef && configContent.includes(oldRef)) {
		configContent = configContent.replaceAll(oldRef, newRef);
		configChanged = true;
	}
}

if (configChanged) {
	writeFileSync(CONFIG_PATH, configContent, 'utf-8');
	console.log('\n✓ config.yml updated with new .webp references');
}

console.log('\nDone.');
