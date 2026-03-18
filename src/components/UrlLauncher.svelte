<script lang="ts">
	const YOUTUBE_REDIRECT = 'https://www.youtube.com/redirect?q=';

	const TRANSLATIONS: Record<string, { placeholder: string; btn: string; error: string }> = {
		en: {
			placeholder: 'Enter a URL to open fullscreen...',
			btn: 'Open',
			error: 'Invalid URL. Example: 192.168.1.10:8006 or https://example.com',
		},
		no: {
			placeholder: 'Skriv inn en URL for å åpne i fullskjerm...',
			btn: 'Åpne',
			error: 'Ugyldig URL. Eksempel: 192.168.1.10:8006 eller https://example.com',
		},
		de: {
			placeholder: 'URL für Vollbildmodus eingeben...',
			btn: 'Öffnen',
			error: 'Ungültige URL. Beispiel: 192.168.1.10:8006 oder https://example.com',
		},
		sv: {
			placeholder: 'Ange en URL för att öppna i helskärm...',
			btn: 'Öppna',
			error: 'Ogiltig URL. Exempel: 192.168.1.10:8006 eller https://example.com',
		},
		nl: {
			placeholder: 'Voer een URL in om op volledig scherm te openen...',
			btn: 'Openen',
			error: 'Ongeldige URL. Voorbeeld: 192.168.1.10:8006 of https://example.com',
		},
		fr: {
			placeholder: 'Entrez une URL pour ouvrir en plein écran...',
			btn: 'Ouvrir',
			error: 'URL invalide. Exemple : 192.168.1.10:8006 ou https://example.com',
		},
		da: {
			placeholder: 'Indtast en URL for at åbne i fuld skærm...',
			btn: 'Åbn',
			error: 'Ugyldig URL. Eksempel: 192.168.1.10:8006 eller https://example.com',
		},
		fi: {
			placeholder: 'Syötä URL avattavaksi koko näytölle...',
			btn: 'Avaa',
			error: 'Virheellinen URL. Esimerkki: 192.168.1.10:8006 tai https://example.com',
		},
		it: {
			placeholder: 'Inserisci un URL da aprire a schermo intero...',
			btn: 'Apri',
			error: 'URL non valido. Esempio: 192.168.1.10:8006 o https://example.com',
		},
		es: {
			placeholder: 'Introduce una URL para abrir en pantalla completa...',
			btn: 'Abrir',
			error: 'URL inválida. Ejemplo: 192.168.1.10:8006 o https://example.com',
		},
		pt: {
			placeholder: 'Digite uma URL para abrir em tela cheia...',
			btn: 'Abrir',
			error: 'URL inválida. Exemplo: 192.168.1.10:8006 ou https://example.com',
		},
		pl: {
			placeholder: 'Wprowadź URL, aby otworzyć na pełnym ekranie...',
			btn: 'Otwórz',
			error: 'Nieprawidłowy URL. Przykład: 192.168.1.10:8006 lub https://example.com',
		},
		zh: {
			placeholder: '输入网址以全屏打开...',
			btn: '打开',
			error: '无效的网址。示例：192.168.1.10:8006 或 https://example.com',
		},
	};

	let lang = $state('en');

	let placeholder = $derived((TRANSLATIONS[lang] ?? TRANSLATIONS['en']).placeholder);
	let btnLabel = $derived((TRANSLATIONS[lang] ?? TRANSLATIONS['en']).btn);
	let errorText = $derived((TRANSLATIONS[lang] ?? TRANSLATIONS['en']).error);

	let url = $state('');
	let error = $state(false);

	$effect(() => {
		// Init from localStorage (client-only)
		const saved = localStorage.getItem('tesdash-lang');
		lang = saved || navigator.language.split('-')[0] || 'en';

		const handler = (e: Event) => {
			const detail = (e as CustomEvent<{ lang: string }>).detail;
			if (detail?.lang) lang = detail.lang;
		};
		window.addEventListener('tesdash:langchange', handler);
		return () => window.removeEventListener('tesdash:langchange', handler);
	});

	function launch() {
		let target = url.trim();
		if (!target) return;

		if (!target.startsWith('http://') && !target.startsWith('https://')) {
			target = 'https://' + target;
		}

		try {
			new URL(target); // valida que sea una URL real
			error = false;
			window.open(`${YOUTUBE_REDIRECT}${encodeURIComponent(target)}`, '_blank');
			url = '';
		} catch {
			error = true;
		}
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') launch();
		if (error) error = false;
	}
</script>

<div class="launcher" class:has-error={error}>
	<div class="input-wrap">
		<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<circle cx="12" cy="12" r="10"/>
			<path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
		</svg>
		<input
			type="url"
			bind:value={url}
			onkeydown={onKeydown}
			oninput={() => error = false}
			placeholder={placeholder}
			autocomplete="off"
			autocorrect="off"
			autocapitalize="off"
			spellcheck={false}
		/>
		{#if url}
			<button class="clear" onclick={() => { url = ''; error = false; }} aria-label="Clear">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M18 6 6 18M6 6l12 12"/>
				</svg>
			</button>
		{/if}
	</div>
	<button class="launch-btn" onclick={launch}>
		{btnLabel}
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
			<polyline points="15 3 21 3 21 9"/>
			<line x1="10" y1="14" x2="21" y2="3"/>
		</svg>
	</button>
</div>
{#if error}
	<p class="error-msg">{errorText}</p>
{/if}

<style>
	.launcher {
		display: flex;
		gap: 0.625rem;
		align-items: center;
		width: 100%;
	}

	.input-wrap {
		flex: 1;
		position: relative;
		display: flex;
		align-items: center;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 14px;
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		transition: border-color 200ms ease, box-shadow 200ms ease;
	}

	.input-wrap:focus-within {
		border-color: rgba(255, 255, 255, 0.25);
		box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.08);
	}

	.has-error .input-wrap {
		border-color: rgba(229, 9, 20, 0.6);
		box-shadow: 0 0 0 3px rgba(229, 9, 20, 0.15);
	}

	.icon {
		width: 20px;
		height: 20px;
		color: #64748b;
		margin-left: 1rem;
		flex-shrink: 0;
	}

	input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		color: #f8fafc;
		font-size: 1rem;
		padding: 0.9rem 0.75rem;
		font-family: inherit;
		min-width: 0;
	}

	input::placeholder {
		color: #475569;
	}

	.clear {
		background: transparent;
		border: none;
		cursor: pointer;
		color: #475569;
		padding: 0.5rem;
		margin-right: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
		transition: color 150ms ease;
		flex-shrink: 0;
	}

	.clear:hover { color: #94a3b8; }

	.clear svg {
		width: 16px;
		height: 16px;
	}

	.launch-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: #E50914;
		color: #fff;
		border: none;
		border-radius: 14px;
		padding: 0.9rem 1.5rem;
		font-size: 1rem;
		font-weight: 600;
		font-family: inherit;
		cursor: pointer;
		white-space: nowrap;
		transition: background 150ms ease, transform 150ms ease;
		flex-shrink: 0;
	}

	.launch-btn:hover { background: #f0141e; transform: scale(1.02); }
	.launch-btn:active { transform: scale(0.97); }

	.launch-btn svg {
		width: 16px;
		height: 16px;
	}

	.error-msg {
		color: #f87171;
		font-size: 0.8rem;
		margin-top: 0.375rem;
		padding-left: 1rem;
	}
</style>
