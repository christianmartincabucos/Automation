# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: video-progress.spec.js >> Automatically play and monitor full-view confirmation
- Location: video-progress.spec.js:5:1

# Error details

```
Error: Waiting for full-view confirmation

Waiting for full-view confirmation

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false

Call Log:
- Timeout 1200000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - paragraph [ref=e5]: Lokal ng LANGTAD · Carcar City, Cebu
        - heading "INCINEMA 2026 | Kaha | Ecclesiastical District of Carcar City, Cebu" [level=1] [ref=e6]
        - paragraph [ref=e7]: Iglesia Ni Cristo Christian Family Organizations
      - generic [ref=e8]:
        - generic [ref=e9]:
          - generic "INCINEMA 2026 | Kaha | Ecclesiastical District of Carcar City, Cebu" [ref=e10]:
            - iframe [active] [ref=e11]:
              - generic "YouTube Video Player" [ref=f1e3]
          - paragraph [ref=e15]: Watched 4% — finish the whole video for it to count
        - generic [ref=e16]:
          - link "Like" [ref=e17] [cursor=pointer]:
            - /url: https://www.youtube.com/watch?v=VIxeHfO4WiE
          - link "Comment" [ref=e18] [cursor=pointer]:
            - /url: https://www.youtube.com/watch?v=VIxeHfO4WiE
          - button "Share" [ref=e19]
      - generic [ref=e20]:
        - paragraph [ref=e21]: 8,488
        - paragraph [ref=e22]: Total Views
        - paragraph [ref=e23]: 878 likes · updates every minute
      - generic [ref=e24]:
        - heading "PAALALA" [level=2] [ref=e25]
        - paragraph [ref=e26]: Panoorin po nang buo ang video at huwag po kalimutan na mag-Like, Comment, at mag-Subscribe sa ating channel.
  - complementary "Edit with Lovable" [ref=e27]:
    - link "Edit with Lovable" [ref=e28] [cursor=pointer]:
      - /url: https://lovable.dev/projects/lovp_6vt563nwnj9jab0bha1szz892r?utm_source=lovable-badge
      - generic [ref=e29]: Edit with
    - button "Dismiss" [ref=e36] [cursor=pointer]
```

# Test source

```ts
  14  |     waitUntil: 'domcontentloaded'
  15  |   });
  16  | 
  17  |   console.log('[START] Dashboard opened.');
  18  | 
  19  |   // Locate YouTube player
  20  |   const iframe = page.locator('iframe[src*="youtube"]').first();
  21  | 
  22  |   await expect(iframe).toBeVisible({ timeout: 30000 });
  23  |   await iframe.scrollIntoViewIfNeeded();
  24  | 
  25  |   const player = page.frameLocator(
  26  |     'iframe[src*="youtube"]'
  27  |   ).first();
  28  | 
  29  |   const video = player.locator('video');
  30  | 
  31  |   await expect(video).toBeVisible({ timeout: 30000 });
  32  | 
  33  |   console.log('[PLAYER] YouTube player detected.');
  34  | 
  35  |   // Attempt to start playback
  36  |   const playButton = player.locator(
  37  |     '.ytp-large-play-button'
  38  |   );
  39  | 
  40  |   const buttonVisible = await playButton
  41  |     .isVisible()
  42  |     .catch(() => false);
  43  | 
  44  |   if (buttonVisible) {
  45  |     await playButton.click();
  46  |     console.log('[PLAY] Clicked YouTube play button.');
  47  |   } else {
  48  |     const bounds = await iframe.boundingBox();
  49  | 
  50  |     if (!bounds) {
  51  |       throw new Error('YouTube player is not visible.');
  52  |     }
  53  | 
  54  |     await page.mouse.click(
  55  |       bounds.x + bounds.width / 2,
  56  |       bounds.y + bounds.height / 2
  57  |     );
  58  | 
  59  |     console.log('[PLAY] Clicked center of player.');
  60  |   }
  61  | 
  62  |   // Verify actual playback
  63  |   await expect.poll(
  64  |     async () => {
  65  |       return video.evaluate(v => ({
  66  |         paused: v.paused,
  67  |         currentTime: v.currentTime
  68  |       }));
  69  |     },
  70  |     {
  71  |       timeout: 30000,
  72  |       intervals: [1000, 2000],
  73  |       message: 'Waiting for playback to start'
  74  |     }
  75  |   ).toMatchObject({
  76  |     paused: false
  77  |   });
  78  | 
  79  |   console.log('[PLAYING] Playback started.');
  80  | 
  81  |   // Monitor dashboard progress and confirmation
  82  |   let lastProgress = -1;
  83  | 
  84  |   const successMessage = page.getByText(
  85  |     'Salamat! Your full view was counted for your lokal.',
  86  |     { exact: true }
  87  |   );
  88  | 
  89  |   console.log('[MONITOR] Waiting for confirmation.');
  90  | 
  91  |   try {
  92  |     await expect.poll(
  93  |       async () => {
  94  |         const body = await page.locator('body').innerText();
  95  | 
  96  |         const match = body.match(/Watched\s+(\d+)%/);
  97  | 
  98  |         if (match) {
  99  |           const progress = Number(match[1]);
  100 | 
  101 |           if (progress !== lastProgress) {
  102 |             console.log(`[PROGRESS] Watched ${progress}%`);
  103 |             lastProgress = progress;
  104 |           }
  105 |         }
  106 | 
  107 |         return await successMessage.isVisible().catch(() => false);
  108 |       },
  109 |       {
  110 |         timeout: 20 * 60 * 1000,
  111 |         intervals: [2000, 3000],
  112 |         message: 'Waiting for full-view confirmation'
  113 |       }
> 114 |     ).toBe(true);
      |       ^ Error: Waiting for full-view confirmation
  115 | 
  116 |     console.log('[SUCCESS] Full-view confirmation detected.');
  117 | 
  118 |     await page.screenshot({
  119 |       path: 'screenshots/full-view-confirmed.png',
  120 |       fullPage: true
  121 |     });
  122 | 
  123 |   } catch (error) {
  124 |     console.log('[FAILED] Confirmation not detected.');
  125 | 
  126 |     await page.screenshot({
  127 |       path: 'screenshots/full-view-failed.png',
  128 |       fullPage: true
  129 |     });
  130 | 
  131 |     throw error;
  132 |   }
  133 | });
  134 | 
```