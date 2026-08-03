/* ================================================================
   TTZOP — relax-games.js: 🎲 РУХАВІК МІНІ-ГУЛЬНЯЎ (адзін кампанент на ЎСЕ куткі:
   панэль admin/index.html РМ Релакс + у перспектыве сайт; узор — reader.js/cdate.js/photoedit.js).

   ААП: гульня — НАШЧАДАК ПРОДАКФПФ, а не асобны тып аб'екта і не асобная старонка.
   Тут жыве толькі тое, што АГУЛЬНАЕ для любой гульні: мантаж у кантэйнер, увод
   (клавіятура + свайп), рэкорд, кнопка «Нанова», экран завяршэння, тэма.
   Канкрэтная гульня дае ТОЛЬКІ канфіг у каталозе `GAMES` (init/move/render) —
   новая гульня = адзін запіс каталога, без праўкі рухавіка.

   Цела малюецца ў Table-секцыі праз хук `bodyFn` (той самы механізм, што Куб і
   прэв'ю схем panelView) — свайго тыпу секцыі гульня НЕ ўводзіць.

   ℹ️ Каталог перанесены са старой папкі `games/` (статычныя HTML-старонкі, што нікуды не
   дэплоіліся). Папка выдалена 29.07 пасля таго, як усе 14 гульняў сталі запісамі GAMES.

   Канфіг каллера — window.TTZOP_GAMES_HOST = {
     t(key):     надпісы (панэль дае t(), сайт — getUI())
   } — кожны кут дае СВАЮ мову; хардкоду тэксту тут няма.
   ================================================================ */

// ── надпісы: каллер вырашае, адкуль браць (панэль t() / сайт getUI()) ──────────
// ═══ 🌍 НАДПІСЫ ГУЛЬНЯЎ — У САМІМ КАМПАНЕНЦЕ (13 моў) ═══
// ⚠️ Раней яны жылі ТОЛЬКІ ў `admin/ui-i18n.js` — а гэта 800+ КБ адміністрацыйнага файла, які на
// публічны сайт НЕ едзе. Значыць гульні на старонцы кліента загаварылі б голымі ключамі
// (`game_snake_name`). Слоўнік гульняў належыць гульням: кампанент і так самадастатковы (нуль
// знешніх запытаў і шрыфтоў) — цяпер ён самадастатковы і па тэксце. Панэль бярэ адсюль жа праз
// `TTZOP_GAMES_T`, таму дом адзін і разысціся няма чаму.
const _GAMES_I18N = {
  be: { game_snake_name: 'Змейка', game_snake_hint: 'Стрэлкі ці свайп — павярніце змейку. Ежа падаўжае яе і паскарае; сцяна і ўласнае цела — канец.', game_snake_stat: 'Даўжыня', game_score: 'Рахунак', game_best: 'Рэкорд', game_new: 'Нанова', game_over: 'Хадоў няма', game_win: 'Гатова! 🎉', game_2048_win: '2048! 🎉', game_continue: 'Гуляць далей', game_2048_hint: 'Стрэлкі або свайп ссоўваюць усё поле. Роўныя пліткі зліваюцца.', game_2048_name: '2048', game_15_name: 'Пятнашкі', game_15_hint: 'Стрэлкі або свайп рухаюць плітку ў пусты квадрат. Мэта — парадак 1–15.', game_mines_name: 'Сапёр', game_mines_hint: 'Клік адкрывае ячэйку, доўгі тап ці правы клік ставіць сцяжок. Лічба — колькі мін побач.', game_gems_name: 'Тры ў рад', game_gems_hint: 'Клікніце два суседнія дыяменты — яны памяняюцца месцамі. Тры аднолькавыя ў рад знікаюць.', game_lines_name: 'Лініі', game_lines_hint: 'Выберыце шар, потым пусты квадрат. Пяць у рад знікаюць; не сабралі — тры новыя шары.', game_flow_name: 'Злучы пункты', game_flow_hint: 'Правядзіце пальцам ад кропкі да яе пары. Шляхі не перасякаюцца.', game_flow_stat: 'Узровень', game_dice_name: 'Кубікі', game_dice_hint: 'Выберыце суму, што выпадзе на двух кубіках, і кіньце. Рахунак — колькі разоў угадалі.', game_dice_guess: 'Ваш прагноз', game_dice_roll: 'Кінуць кубікі', game_dice_hit: 'Угадалі!', game_dice_miss: 'Не ўгадалі', game_dice_stat: 'Кіданняў', game_coin_name: 'Манета', game_coin_hint: 'Выберыце бок і падкіньце манету. Рахунак — колькі разоў угадалі.', game_coin_guess: 'Ваш прагноз', game_coin_flip: 'Падкінуць', game_coin_stat: 'Кіданняў', game_coin_heads: 'Арол', game_coin_tails: 'Рэшка', game_ttt_name: 'Крыжыкі-нулікі', game_ttt_hint: 'Вы ходзіце ✕. Тры ў рад — перамога. Машына гуляе моцна, але яе можна абыграць вілкай.', game_ttt_over: 'Партыя скончана', game_dots_name: 'Кропкі', game_dots_stat: 'Ходы', game_dots_hint: 'Вядзіце па суседніх кропках аднаго колеру — адпусціце, і яны знікнуць. Замкнёнае кола прыбірае ўсе кропкі гэтага колеру.', game_strings_name: 'Правядзі лініі', game_strings_hint: 'Правядзіце лінію ад кропкі да кропкі таго ж колеру. Лініі не перасякаюцца і не выходзяць за круг.', game_strings_stat: 'Узровень', game_untangle_name: 'Распутай лініі', game_untangle_cross: 'Скрыжаванні:', game_untangle_hint: 'Перацягвайце кропкі мышкай, пакуль лініі не перастануць перасякацца.', game_arkanoid_name: 'Арканоід', game_arkanoid_launch: 'Націсніце, каб запусціць', game_arkanoid_hint: 'Мышка ці ← → вядуць ракетку. Націсніце, каб запусціць мяч. Разбіце ўсе пліткі — у запасе тры мячы.', game_arkanoid_stat: 'Узровень', game_hint: 'Стрэлкі або свайп.' },
  en: { game_snake_name: 'Snake', game_snake_hint: 'Arrows or swipe to turn. Food makes the snake longer and faster; a wall or your own body ends the run.', game_snake_stat: 'Length', game_score: 'Score', game_best: 'Best', game_new: 'New game', game_over: 'No moves left', game_win: 'Solved! 🎉', game_2048_win: '2048! 🎉', game_continue: 'Keep playing', game_2048_hint: 'Arrows or a swipe move the whole board. Equal tiles merge.', game_2048_name: '2048', game_15_name: '15 Puzzle', game_15_hint: 'Arrows or a swipe move a tile into the empty square. Goal: order 1–15.', game_mines_name: 'Minesweeper', game_mines_hint: 'Click opens a cell; long press or right click sets a flag. The number counts mines nearby.', game_gems_name: 'Match Three', game_gems_hint: 'Click two neighbouring gems to swap them. Three alike in a row disappear.', game_lines_name: 'Lines', game_lines_hint: 'Pick a ball, then an empty square. Five in a row clear; otherwise three new balls appear.', game_flow_name: 'Connect the Dots', game_flow_hint: 'Drag from a dot to its pair. Paths must not cross.', game_flow_stat: 'Level', game_dice_name: 'Dice', game_dice_hint: 'Pick the total of the two dice, then roll. Score counts your correct guesses.', game_dice_guess: 'Your guess', game_dice_roll: 'Roll the dice', game_dice_hit: 'Correct!', game_dice_miss: 'Missed', game_dice_stat: 'Rolls', game_coin_name: 'Coin', game_coin_hint: 'Pick a side and flip the coin. Score counts your correct guesses.', game_coin_guess: 'Your guess', game_coin_flip: 'Flip', game_coin_stat: 'Rolls', game_coin_heads: 'Heads', game_coin_tails: 'Tails', game_ttt_name: 'Tic-Tac-Toe', game_ttt_hint: 'You play ✕. Three in a row wins. The machine plays well, but a fork beats it.', game_ttt_over: 'Game over', game_dots_name: 'Dots', game_dots_stat: 'Moves', game_dots_hint: 'Drag across neighbouring dots of one colour — release and they clear. A closed loop removes every dot of that colour.', game_strings_name: 'Draw the Lines', game_strings_hint: 'Draw a line from a dot to its colour match. Lines must not cross or leave the circle.', game_strings_stat: 'Level', game_untangle_name: 'Untangle', game_untangle_cross: 'Crossings:', game_untangle_hint: 'Drag the dots until no lines cross each other.', game_arkanoid_name: 'Breakout', game_arkanoid_launch: 'Click to launch', game_arkanoid_hint: 'Mouse or ← → move the paddle. Click to launch. Break every brick — you have three balls.', game_arkanoid_stat: 'Level', game_hint: 'Arrows or swipe.' },
  uk: { game_snake_name: 'Змійка', game_snake_hint: 'Стрілки або свайп — поверніть змійку. Їжа подовжує її та пришвидшує; стіна і власне тіло — кінець.', game_snake_stat: 'Довжина', game_score: 'Рахунок', game_best: 'Рекорд', game_new: 'Заново', game_over: 'Ходів немає', game_win: 'Готово! 🎉', game_2048_win: '2048! 🎉', game_continue: 'Грати далі', game_2048_hint: 'Стрілки або свайп зсувають усе поле. Однакові плитки зливаються.', game_2048_name: '2048', game_15_name: 'П\'ятнашки', game_15_hint: 'Стрілки або свайп рухають плитку в порожній квадрат. Мета — порядок 1–15.', game_mines_name: 'Сапер', game_mines_hint: 'Клік відкриває клітинку, довгий тап або правий клік ставить прапорець. Число — скільки мін поруч.', game_gems_name: 'Три в ряд', game_gems_hint: 'Клацніть два сусідні самоцвіти — вони поміняються місцями. Три однакові в ряд зникають.', game_lines_name: 'Лінії', game_lines_hint: 'Виберіть кулю, потім порожній квадрат. П’ять у ряд зникають; ні — три нові кулі.', game_flow_name: 'З’єднай точки', game_flow_hint: 'Проведіть пальцем від точки до її пари. Шляхи не перетинаються.', game_flow_stat: 'Рівень', game_dice_name: 'Кубики', game_dice_hint: 'Виберіть суму, що випаде на двох кубиках, і киньте. Рахунок — скільки разів вгадали.', game_dice_guess: 'Ваш прогноз', game_dice_roll: 'Кинути кубики', game_dice_hit: 'Вгадали!', game_dice_miss: 'Не вгадали', game_dice_stat: 'Кидків', game_coin_name: 'Монета', game_coin_hint: 'Виберіть бік і підкиньте монету. Рахунок — скільки разів вгадали.', game_coin_guess: 'Ваш прогноз', game_coin_flip: 'Підкинути', game_coin_stat: 'Кидків', game_coin_heads: 'Орел', game_coin_tails: 'Решка', game_ttt_name: 'Хрестики-нулики', game_ttt_hint: 'Ви ходите ✕. Три в ряд — перемога. Машина грає сильно, але її можна обіграти вилкою.', game_ttt_over: 'Партію завершено', game_dots_name: 'Крапки', game_dots_stat: 'Ходи', game_dots_hint: 'Ведіть по сусідніх крапках одного кольору — відпустіть, і вони зникнуть. Замкнене коло прибирає всі крапки цього кольору.', game_strings_name: 'Проведи лінії', game_strings_hint: 'Проведіть лінію від точки до точки того самого кольору. Лінії не перетинаються й не виходять за коло.', game_strings_stat: 'Рівень', game_untangle_name: 'Розплутай лінії', game_untangle_cross: 'Перетини:', game_untangle_hint: 'Перетягуйте точки мишкою, доки лінії не перестануть перетинатися.', game_arkanoid_name: 'Арканоїд', game_arkanoid_launch: 'Натисніть, щоб запустити', game_arkanoid_hint: 'Миша або ← → ведуть ракетку. Натисніть, щоб запустити. Розбийте всі плитки — у запасі три м’ячі.', game_arkanoid_stat: 'Рівень', game_hint: 'Стрілки або свайп.' },
  ru: { game_snake_name: 'Змейка', game_snake_hint: 'Стрелки или свайп — поверните змейку. Еда удлиняет её и ускоряет; стена и собственное тело — конец.', game_snake_stat: 'Длина', game_score: 'Счёт', game_best: 'Рекорд', game_new: 'Заново', game_over: 'Ходов нет', game_win: 'Готово! 🎉', game_2048_win: '2048! 🎉', game_continue: 'Играть дальше', game_2048_hint: 'Стрелки или свайп сдвигают всё поле. Одинаковые плитки сливаются.', game_2048_name: '2048', game_15_name: 'Пятнашки', game_15_hint: 'Стрелки или свайп двигают плитку в пустой квадрат. Цель — порядок 1–15.', game_mines_name: 'Сапёр', game_mines_hint: 'Клик открывает клетку, долгий тап или правый клик ставит флажок. Число — сколько мин рядом.', game_gems_name: 'Три в ряд', game_gems_hint: 'Кликните два соседних самоцвета — они поменяются местами. Три одинаковых в ряд исчезают.', game_lines_name: 'Линии', game_lines_hint: 'Выберите шар, затем пустой квадрат. Пять в ряд исчезают; нет — три новых шара.', game_flow_name: 'Соедини точки', game_flow_hint: 'Проведите пальцем от точки к её паре. Пути не пересекаются.', game_flow_stat: 'Уровень', game_dice_name: 'Кубики', game_dice_hint: 'Выберите сумму, что выпадет на двух кубиках, и бросьте. Счёт — сколько раз угадали.', game_dice_guess: 'Ваш прогноз', game_dice_roll: 'Бросить кубики', game_dice_hit: 'Угадали!', game_dice_miss: 'Не угадали', game_dice_stat: 'Бросков', game_coin_name: 'Монета', game_coin_hint: 'Выберите сторону и подбросьте монету. Счёт — сколько раз угадали.', game_coin_guess: 'Ваш прогноз', game_coin_flip: 'Подбросить', game_coin_stat: 'Бросков', game_coin_heads: 'Орёл', game_coin_tails: 'Решка', game_ttt_name: 'Крестики-нолики', game_ttt_hint: 'Вы ходите ✕. Три в ряд — победа. Машина играет сильно, но её можно обыграть вилкой.', game_ttt_over: 'Партия окончена', game_dots_name: 'Точки', game_dots_stat: 'Ходы', game_dots_hint: 'Ведите по соседним точкам одного цвета — отпустите, и они исчезнут. Замкнутое кольцо убирает все точки этого цвета.', game_strings_name: 'Проведи линии', game_strings_hint: 'Проведите линию от точки к точке того же цвета. Линии не пересекаются и не выходят за круг.', game_strings_stat: 'Уровень', game_untangle_name: 'Распутай линии', game_untangle_cross: 'Пересечения:', game_untangle_hint: 'Перетаскивайте точки мышью, пока линии не перестанут пересекаться.', game_arkanoid_name: 'Арканоид', game_arkanoid_launch: 'Нажмите, чтобы запустить', game_arkanoid_hint: 'Мышь или ← → ведут ракетку. Нажмите, чтобы запустить. Разбейте все плитки — в запасе три мяча.', game_arkanoid_stat: 'Уровень', game_hint: 'Стрелки или свайп.' },
  pl: { game_snake_name: 'Wąż', game_snake_hint: 'Strzałki lub gest — skręć wężem. Jedzenie wydłuża go i przyspiesza; ściana i własne ciało kończą grę.', game_snake_stat: 'Długość', game_score: 'Wynik', game_best: 'Rekord', game_new: 'Od nowa', game_over: 'Brak ruchów', game_win: 'Gotowe! 🎉', game_2048_win: '2048! 🎉', game_continue: 'Graj dalej', game_2048_hint: 'Strzałki lub przesunięcie palcem przesuwają całą planszę. Równe kafelki łączą się.', game_2048_name: '2048', game_15_name: 'Piętnastka', game_15_hint: 'Strzałki lub przesunięcie przesuwają kafelek na puste pole. Cel: kolejność 1–15.', game_mines_name: 'Saper', game_mines_hint: 'Kliknięcie odsłania pole, długie przytrzymanie lub prawy klik stawia flagę. Liczba to miny obok.', game_gems_name: 'Trzy w rzędzie', game_gems_hint: 'Kliknij dwa sąsiednie klejnoty, aby je zamienić. Trzy takie same znikają.', game_lines_name: 'Linie', game_lines_hint: 'Wybierz kulę, potem puste pole. Pięć w rzędzie znika; jeśli nie — trzy nowe kule.', game_flow_name: 'Połącz kropki', game_flow_hint: 'Przeciągnij od kropki do jej pary. Ścieżki nie mogą się przecinać.', game_flow_stat: 'Poziom', game_dice_name: 'Kostki', game_dice_hint: 'Wybierz sumę oczek na dwóch kostkach i rzuć. Wynik to liczba trafień.', game_dice_guess: 'Twój typ', game_dice_roll: 'Rzuć kostkami', game_dice_hit: 'Trafione!', game_dice_miss: 'Pudło', game_dice_stat: 'Rzuty', game_coin_name: 'Moneta', game_coin_hint: 'Wybierz stronę i rzuć monetą. Wynik to liczba trafień.', game_coin_guess: 'Twój typ', game_coin_flip: 'Rzuć', game_coin_stat: 'Rzuty', game_coin_heads: 'Orzeł', game_coin_tails: 'Reszka', game_ttt_name: 'Kółko i krzyżyk', game_ttt_hint: 'Grasz ✕. Trzy w rzędzie wygrywają. Maszyna gra mocno, ale widelec ją pokona.', game_ttt_over: 'Koniec partii', game_dots_name: 'Kropki', game_dots_stat: 'Ruchy', game_dots_hint: 'Przeciągaj po sąsiednich kropkach jednego koloru — puść, a znikną. Zamknięta pętla usuwa wszystkie kropki tego koloru.', game_strings_name: 'Poprowadź linie', game_strings_hint: 'Poprowadź linię od kropki do kropki w tym samym kolorze. Linie nie mogą się przecinać ani wychodzić poza koło.', game_strings_stat: 'Poziom', game_untangle_name: 'Rozplącz linie', game_untangle_cross: 'Przecięcia:', game_untangle_hint: 'Przeciągaj kropki, aż linie przestaną się przecinać.', game_arkanoid_name: 'Arkanoid', game_arkanoid_launch: 'Kliknij, aby wystrzelić', game_arkanoid_hint: 'Mysz lub ← → prowadzą paletkę. Kliknij, aby wystrzelić. Rozbij wszystkie klocki — masz trzy piłki.', game_arkanoid_stat: 'Poziom', game_hint: 'Strzałki lub przesunięcie.' },
  de: { game_snake_name: 'Schlange', game_snake_hint: 'Pfeiltasten oder Wischen zum Abbiegen. Futter macht die Schlange länger und schneller; Wand oder eigener Körper beenden das Spiel.', game_snake_stat: 'Länge', game_score: 'Punkte', game_best: 'Rekord', game_new: 'Neu', game_over: 'Keine Züge mehr', game_win: 'Geschafft! 🎉', game_2048_win: '2048! 🎉', game_continue: 'Weiterspielen', game_2048_hint: 'Pfeiltasten oder Wischen verschieben das ganze Feld. Gleiche Kacheln verschmelzen.', game_2048_name: '2048', game_15_name: '15er-Puzzle', game_15_hint: 'Pfeiltasten oder Wischen schieben eine Kachel ins leere Feld. Ziel: Reihenfolge 1–15.', game_mines_name: 'Minesweeper', game_mines_hint: 'Klick deckt ein Feld auf, langes Drücken oder Rechtsklick setzt eine Fahne. Die Zahl zeigt Minen daneben.', game_gems_name: 'Drei gewinnt', game_gems_hint: 'Zwei benachbarte Steine anklicken, um sie zu tauschen. Drei gleiche in einer Reihe verschwinden.', game_lines_name: 'Linien', game_lines_hint: 'Erst eine Kugel, dann ein leeres Feld. Fünf in einer Reihe verschwinden; sonst kommen drei neue Kugeln.', game_flow_name: 'Punkte verbinden', game_flow_hint: 'Ziehe von einem Punkt zu seinem Partner. Die Wege dürfen sich nicht kreuzen.', game_flow_stat: 'Level', game_dice_name: 'Würfel', game_dice_hint: 'Wähle die Summe beider Würfel und wirf. Punkte = richtige Tipps.', game_dice_guess: 'Dein Tipp', game_dice_roll: 'Würfeln', game_dice_hit: 'Richtig!', game_dice_miss: 'Daneben', game_dice_stat: 'Würfe', game_coin_name: 'Münze', game_coin_hint: 'Wähle eine Seite und wirf die Münze. Punkte = richtige Tipps.', game_coin_guess: 'Dein Tipp', game_coin_flip: 'Werfen', game_coin_stat: 'Würfe', game_coin_heads: 'Kopf', game_coin_tails: 'Zahl', game_ttt_name: 'Tic-Tac-Toe', game_ttt_hint: 'Du spielst ✕. Drei in einer Reihe gewinnen. Die Maschine spielt stark, aber eine Gabel schlägt sie.', game_ttt_over: 'Partie beendet', game_dots_name: 'Punkte', game_dots_stat: 'Züge', game_dots_hint: 'Ziehe über benachbarte Punkte einer Farbe — loslassen, und sie verschwinden. Eine geschlossene Schleife entfernt alle Punkte dieser Farbe.', game_strings_name: 'Linien ziehen', game_strings_hint: 'Ziehe eine Linie von einem Punkt zu seinem Farbpartner. Linien dürfen sich nicht kreuzen und nicht aus dem Kreis führen.', game_strings_stat: 'Level', game_untangle_name: 'Entwirren', game_untangle_cross: 'Kreuzungen:', game_untangle_hint: 'Ziehe die Punkte, bis sich keine Linien mehr kreuzen.', game_arkanoid_name: 'Breakout', game_arkanoid_launch: 'Klicken zum Abschuss', game_arkanoid_hint: 'Maus oder ← → führen den Schläger. Klicke zum Start. Zerschlage alle Steine — du hast drei Bälle.', game_arkanoid_stat: 'Level', game_hint: 'Pfeiltasten oder Wischen.' },
  fr: { game_snake_name: 'Serpent', game_snake_hint: 'Flèches ou balayage pour tourner. La nourriture allonge et accélère le serpent ; un mur ou son propre corps met fin à la partie.', game_snake_stat: 'Longueur', game_score: 'Score', game_best: 'Record', game_new: 'Nouvelle partie', game_over: 'Plus de coups', game_win: 'Réussi ! 🎉', game_2048_win: '2048! 🎉', game_continue: 'Continuer', game_2048_hint: 'Les flèches ou le balayage déplacent tout le plateau. Les tuiles égales fusionnent.', game_2048_name: '2048', game_15_name: 'Taquin', game_15_hint: 'Les flèches ou le balayage déplacent une tuile vers la case vide. But : ordre 1–15.', game_mines_name: 'Démineur', game_mines_hint: 'Un clic ouvre une case ; appui long ou clic droit pose un drapeau. Le chiffre compte les mines voisines.', game_gems_name: 'Match-3', game_gems_hint: 'Cliquez deux gemmes voisines pour les échanger. Trois identiques alignées disparaissent.', game_lines_name: 'Lignes', game_lines_hint: 'Choisissez une bille, puis une case vide. Cinq alignées disparaissent ; sinon trois nouvelles billes.', game_flow_name: 'Relier les points', game_flow_hint: 'Faites glisser d’un point vers son jumeau. Les chemins ne se croisent pas.', game_flow_stat: 'Niveau', game_dice_name: 'Dés', game_dice_hint: 'Choisissez la somme des deux dés, puis lancez. Le score compte vos bonnes réponses.', game_dice_guess: 'Votre pronostic', game_dice_roll: 'Lancer les dés', game_dice_hit: 'Gagné !', game_dice_miss: 'Raté', game_dice_stat: 'Lancers', game_coin_name: 'Pièce', game_coin_hint: 'Choisissez un côté et lancez la pièce. Le score compte vos bonnes réponses.', game_coin_guess: 'Votre pronostic', game_coin_flip: 'Lancer', game_coin_stat: 'Lancers', game_coin_heads: 'Face', game_coin_tails: 'Pile', game_ttt_name: 'Morpion', game_ttt_hint: 'Vous jouez ✕. Trois alignés gagnent. La machine joue bien, mais une fourchette la bat.', game_ttt_over: 'Partie terminée', game_dots_name: 'Points', game_dots_stat: 'Coups', game_dots_hint: 'Glissez sur des points voisins de même couleur — relâchez et ils disparaissent. Une boucle fermée enlève tous les points de cette couleur.', game_strings_name: 'Tracer les lignes', game_strings_hint: 'Tracez une ligne d’un point à son jumeau de couleur. Les lignes ne doivent ni se croiser ni sortir du cercle.', game_strings_stat: 'Niveau', game_untangle_name: 'Démêler', game_untangle_cross: 'Croisements :', game_untangle_hint: 'Déplacez les points jusqu’à ce qu’aucune ligne ne se croise.', game_arkanoid_name: 'Casse-briques', game_arkanoid_launch: 'Cliquez pour lancer', game_arkanoid_hint: 'La souris ou ← → déplacent la raquette. Cliquez pour lancer. Cassez toutes les briques — trois billes.', game_arkanoid_stat: 'Niveau', game_hint: 'Flèches ou balayage.' },
  es: { game_snake_name: 'Serpiente', game_snake_hint: 'Flechas o deslizar para girar. La comida la alarga y acelera; un muro o su propio cuerpo terminan la partida.', game_snake_stat: 'Longitud', game_score: 'Puntos', game_best: 'Récord', game_new: 'Nueva partida', game_over: 'Sin movimientos', game_win: '¡Resuelto! 🎉', game_2048_win: '2048! 🎉', game_continue: 'Seguir jugando', game_2048_hint: 'Las flechas o el deslizamiento mueven todo el tablero. Las fichas iguales se fusionan.', game_2048_name: '2048', game_15_name: 'Puzle 15', game_15_hint: 'Las flechas o el deslizamiento mueven una ficha al hueco. Objetivo: orden 1–15.', game_mines_name: 'Buscaminas', game_mines_hint: 'Un clic abre la casilla; pulsación larga o clic derecho pone bandera. El número cuenta minas vecinas.', game_gems_name: 'Tres en línea', game_gems_hint: 'Haz clic en dos gemas vecinas para intercambiarlas. Tres iguales en línea desaparecen.', game_lines_name: 'Líneas', game_lines_hint: 'Elige una bola y luego un hueco. Cinco en línea desaparecen; si no, salen tres bolas nuevas.', game_flow_name: 'Une los puntos', game_flow_hint: 'Arrastra de un punto a su pareja. Los caminos no se cruzan.', game_flow_stat: 'Nivel', game_dice_name: 'Dados', game_dice_hint: 'Elige la suma de los dos dados y tira. Los puntos cuentan tus aciertos.', game_dice_guess: 'Tu pronóstico', game_dice_roll: 'Tirar los dados', game_dice_hit: '¡Acertaste!', game_dice_miss: 'Fallaste', game_dice_stat: 'Tiradas', game_coin_name: 'Moneda', game_coin_hint: 'Elige una cara y lanza la moneda. Los puntos cuentan tus aciertos.', game_coin_guess: 'Tu pronóstico', game_coin_flip: 'Lanzar', game_coin_stat: 'Tiradas', game_coin_heads: 'Cara', game_coin_tails: 'Cruz', game_ttt_name: 'Tres en raya', game_ttt_hint: 'Juegas con ✕. Tres en línea gana. La máquina juega fuerte, pero un doble ataque la vence.', game_ttt_over: 'Partida terminada', game_dots_name: 'Puntos', game_dots_stat: 'Movimientos', game_dots_hint: 'Arrastra por puntos vecinos del mismo color; suelta y desaparecen. Un bucle cerrado quita todos los puntos de ese color.', game_strings_name: 'Traza las líneas', game_strings_hint: 'Traza una línea de un punto a su par del mismo color. Las líneas no deben cruzarse ni salir del círculo.', game_strings_stat: 'Nivel', game_untangle_name: 'Desenreda', game_untangle_cross: 'Cruces:', game_untangle_hint: 'Arrastra los puntos hasta que ninguna línea se cruce.', game_arkanoid_name: 'Arkanoid', game_arkanoid_launch: 'Haz clic para lanzar', game_arkanoid_hint: 'El ratón o ← → mueven la paleta. Haz clic para lanzar. Rompe todos los ladrillos — tres bolas.', game_arkanoid_stat: 'Nivel', game_hint: 'Flechas o deslizamiento.' },
  it: { game_snake_name: 'Serpente', game_snake_hint: 'Frecce o swipe per girare. Il cibo lo allunga e accelera; un muro o il proprio corpo terminano la partita.', game_snake_stat: 'Lunghezza', game_score: 'Punteggio', game_best: 'Record', game_new: 'Nuova partita', game_over: 'Nessuna mossa', game_win: 'Fatto! 🎉', game_2048_win: '2048! 🎉', game_continue: 'Continua', game_2048_hint: 'Le frecce o lo scorrimento spostano tutta la griglia. Le tessere uguali si uniscono.', game_2048_name: '2048', game_15_name: 'Gioco del 15', game_15_hint: 'Le frecce o lo scorrimento spostano una tessera nella casella vuota. Obiettivo: ordine 1–15.', game_mines_name: 'Campo minato', game_mines_hint: 'Il clic apre la cella; pressione lunga o clic destro mette la bandierina. Il numero conta le mine vicine.', game_gems_name: 'Tre in fila', game_gems_hint: 'Clicca due gemme vicine per scambiarle. Tre uguali in fila spariscono.', game_lines_name: 'Linee', game_lines_hint: 'Scegli una biglia, poi una casella vuota. Cinque in fila spariscono; altrimenti arrivano tre biglie.', game_flow_name: 'Unisci i punti', game_flow_hint: 'Trascina da un punto al suo gemello. I percorsi non si incrociano.', game_flow_stat: 'Livello', game_dice_name: 'Dadi', game_dice_hint: 'Scegli la somma dei due dadi e lancia. Il punteggio conta le risposte esatte.', game_dice_guess: 'Il tuo pronostico', game_dice_roll: 'Lancia i dadi', game_dice_hit: 'Indovinato!', game_dice_miss: 'Sbagliato', game_dice_stat: 'Lanci', game_coin_name: 'Moneta', game_coin_hint: 'Scegli una faccia e lancia la moneta. Il punteggio conta le risposte esatte.', game_coin_guess: 'Il tuo pronostico', game_coin_flip: 'Lancia', game_coin_stat: 'Lanci', game_coin_heads: 'Testa', game_coin_tails: 'Croce', game_ttt_name: 'Tris', game_ttt_hint: 'Giochi con ✕. Tre in fila vincono. La macchina gioca bene, ma un doppio attacco la batte.', game_ttt_over: 'Partita finita', game_dots_name: 'Punti', game_dots_stat: 'Mosse', game_dots_hint: 'Trascina su punti vicini dello stesso colore: rilascia e spariscono. Un anello chiuso toglie tutti i punti di quel colore.', game_strings_name: 'Traccia le linee', game_strings_hint: 'Traccia una linea da un punto al suo gemello di colore. Le linee non devono incrociarsi né uscire dal cerchio.', game_strings_stat: 'Livello', game_untangle_name: 'Districa', game_untangle_cross: 'Incroci:', game_untangle_hint: 'Trascina i punti finché nessuna linea si incrocia.', game_arkanoid_name: 'Arkanoid', game_arkanoid_launch: 'Clicca per lanciare', game_arkanoid_hint: 'Mouse o ← → muovono la racchetta. Clicca per lanciare. Rompi tutti i mattoni — tre palline.', game_arkanoid_stat: 'Livello', game_hint: 'Frecce o scorrimento.' },
  pt: { game_snake_name: 'Cobra', game_snake_hint: 'Setas ou deslizar para virar. A comida alonga-a e acelera; uma parede ou o próprio corpo terminam o jogo.', game_snake_stat: 'Comprimento', game_score: 'Pontos', game_best: 'Recorde', game_new: 'Novo jogo', game_over: 'Sem jogadas', game_win: 'Resolvido! 🎉', game_2048_win: '2048! 🎉', game_continue: 'Continuar', game_2048_hint: 'As setas ou o deslize movem todo o tabuleiro. Peças iguais juntam-se.', game_2048_name: '2048', game_15_name: 'Jogo do 15', game_15_hint: 'As setas ou o deslize movem uma peça para o espaço vazio. Objetivo: ordem 1–15.', game_mines_name: 'Campo minado', game_mines_hint: 'O clique abre a célula; toque longo ou clique direito marca bandeira. O número conta minas ao lado.', game_gems_name: 'Três em linha', game_gems_hint: 'Clique em duas gemas vizinhas para trocá-las. Três iguais em linha desaparecem.', game_lines_name: 'Linhas', game_lines_hint: 'Escolha uma bola e depois um espaço vazio. Cinco em linha somem; senão surgem três bolas novas.', game_flow_name: 'Liga os pontos', game_flow_hint: 'Arraste de um ponto até o par dele. Os caminhos não se cruzam.', game_flow_stat: 'Nível', game_dice_name: 'Dados', game_dice_hint: 'Escolha a soma dos dois dados e lance. Os pontos contam os acertos.', game_dice_guess: 'O seu palpite', game_dice_roll: 'Lançar os dados', game_dice_hit: 'Acertou!', game_dice_miss: 'Falhou', game_dice_stat: 'Lançamentos', game_coin_name: 'Moeda', game_coin_hint: 'Escolha uma face e lance a moeda. Os pontos contam os acertos.', game_coin_guess: 'O seu palpite', game_coin_flip: 'Lançar', game_coin_stat: 'Lançamentos', game_coin_heads: 'Cara', game_coin_tails: 'Coroa', game_ttt_name: 'Jogo do galo', game_ttt_hint: 'Joga com ✕. Três em linha ganha. A máquina joga bem, mas um duplo ataque vence-a.', game_ttt_over: 'Partida terminada', game_dots_name: 'Pontos', game_dots_stat: 'Jogadas', game_dots_hint: 'Arraste por pontos vizinhos da mesma cor — solte e desaparecem. Um laço fechado remove todos os pontos dessa cor.', game_strings_name: 'Traça as linhas', game_strings_hint: 'Trace uma linha de um ponto ao par da mesma cor. As linhas não podem cruzar-se nem sair do círculo.', game_strings_stat: 'Nível', game_untangle_name: 'Desemaranha', game_untangle_cross: 'Cruzamentos:', game_untangle_hint: 'Arraste os pontos até nenhuma linha se cruzar.', game_arkanoid_name: 'Arkanoid', game_arkanoid_launch: 'Clique para lançar', game_arkanoid_hint: 'O rato ou ← → movem a raquete. Clique para lançar. Parta todos os tijolos — três bolas.', game_arkanoid_stat: 'Nível', game_hint: 'Setas ou deslize.' },
  zh: { game_snake_name: '贪吃蛇', game_snake_hint: '方向键或滑动转向。食物会让蛇变长变快；撞墙或撞到自己即结束。', game_snake_stat: '长度', game_score: '分数', game_best: '最高分', game_new: '重新开始', game_over: '无法移动', game_win: '完成！🎉', game_2048_win: '2048! 🎉', game_continue: '继续玩', game_2048_hint: '方向键或滑动可移动整个棋盘，相同的方块会合并。', game_2048_name: '2048', game_15_name: '数字华容道', game_15_hint: '方向键或滑动可把方块移入空格。目标：排成 1–15。', game_mines_name: '扫雷', game_mines_hint: '点击翻开格子，长按或右键插旗。数字表示相邻的地雷数。', game_gems_name: '三消', game_gems_hint: '点击两个相邻的宝石即可交换。三个相同连成一线即消除。', game_lines_name: '连线', game_lines_hint: '先选一个球，再选空格。五个连成一线即消除；否则出现三个新球。', game_flow_name: '连点成线', game_flow_hint: '从一个点拖到它的同色点。路径不能交叉。', game_flow_stat: '关卡', game_dice_name: '骰子', game_dice_hint: '先猜两颗骰子的点数之和，再掷出。分数为猜中的次数。', game_dice_guess: '你的预测', game_dice_roll: '掷骰子', game_dice_hit: '猜中了！', game_dice_miss: '没猜中', game_dice_stat: '次数', game_coin_name: '硬币', game_coin_hint: '先选一面，再抛硬币。分数为猜中的次数。', game_coin_guess: '你的预测', game_coin_flip: '抛硬币', game_coin_stat: '次数', game_coin_heads: '正面', game_coin_tails: '反面', game_ttt_name: '井字棋', game_ttt_hint: '你执 ✕。三子连线即获胜。机器很强，但可以用双威胁战胜它。', game_ttt_over: '对局结束', game_dots_name: '点点', game_dots_stat: '步数', game_dots_hint: '沿着相邻的同色圆点拖动，松手即可消除。围成闭环可消除该颜色的全部圆点。', game_strings_name: '画出连线', game_strings_hint: '从一个点画到同色的点。连线不能相交，也不能超出圆圈。', game_strings_stat: '关卡', game_untangle_name: '解开连线', game_untangle_cross: '交叉：', game_untangle_hint: '拖动圆点，直到没有连线相交。', game_arkanoid_name: '打砖块', game_arkanoid_launch: '点击发球', game_arkanoid_hint: '鼠标或 ← → 控制挡板。点击发球。打掉所有砖块——共有三个球。', game_arkanoid_stat: '关卡', game_hint: '方向键或滑动。' },
  ar: { game_snake_name: 'الأفعى', game_snake_hint: 'الأسهم أو السحب للانعطاف. الطعام يطيلها ويسرّعها؛ الاصطدام بالجدار أو بجسدها ينهي الجولة.', game_snake_stat: 'الطول', game_score: 'النتيجة', game_best: 'الأفضل', game_new: 'لعبة جديدة', game_over: 'لا توجد حركات', game_win: 'أُنجز! 🎉', game_2048_win: '2048! 🎉', game_continue: 'متابعة اللعب', game_2048_hint: 'الأسهم أو السحب تحرّك اللوحة كاملة. البلاطات المتساوية تندمج.', game_2048_name: '2048', game_15_name: 'لعبة 15', game_15_hint: 'الأسهم أو السحب تنقل البلاطة إلى المربع الفارغ. الهدف: الترتيب 1–15.', game_mines_name: 'كانسة الألغام', game_mines_hint: 'النقر يفتح الخانة، والضغط المطوّل أو النقر الأيمن يضع علامة. الرقم يدل على عدد الألغام المجاورة.', game_gems_name: 'ثلاثة متطابقة', game_gems_hint: 'انقر جوهرتين متجاورتين لتبديلهما. ثلاث متشابهة في صف تختفي.', game_lines_name: 'خطوط', game_lines_hint: 'اختر كرة ثم مربعًا فارغًا. خمس في صف تختفي، وإلا تظهر ثلاث كرات جديدة.', game_flow_name: 'صل النقاط', game_flow_hint: 'اسحب من نقطة إلى نظيرتها. المسارات لا تتقاطع.', game_flow_stat: 'المستوى', game_dice_name: 'النرد', game_dice_hint: 'اختر مجموع النردين ثم ارمِ. النتيجة هي عدد التخمينات الصحيحة.', game_dice_guess: 'توقعك', game_dice_roll: 'ارمِ النرد', game_dice_hit: 'صحيح!', game_dice_miss: 'خطأ', game_dice_stat: 'الرميات', game_coin_name: 'عملة', game_coin_hint: 'اختر وجهًا ثم اقذف العملة. النتيجة هي عدد التخمينات الصحيحة.', game_coin_guess: 'توقعك', game_coin_flip: 'اقذف', game_coin_stat: 'الرميات', game_coin_heads: 'صورة', game_coin_tails: 'كتابة', game_ttt_name: 'إكس أو', game_ttt_hint: 'تلعب بـ ✕. ثلاثة في صف تفوز. الآلة قوية، لكن الشوكة تهزمها.', game_ttt_over: 'انتهت المباراة', game_dots_name: 'النقاط', game_dots_stat: 'الحركات', game_dots_hint: 'اسحب عبر نقاط متجاورة بنفس اللون ثم اترك، فتختفي. الحلقة المغلقة تزيل كل نقاط ذلك اللون.', game_strings_name: 'ارسم الخطوط', game_strings_hint: 'ارسم خطًا من نقطة إلى نظيرتها بنفس اللون. يجب ألا تتقاطع الخطوط أو تخرج من الدائرة.', game_strings_stat: 'المستوى', game_untangle_name: 'فك التشابك', game_untangle_cross: 'التقاطعات:', game_untangle_hint: 'اسحب النقاط حتى لا تتقاطع أي خطوط.', game_arkanoid_name: 'كسر الطوب', game_arkanoid_launch: 'انقر للإطلاق', game_arkanoid_hint: 'الفأرة أو ← → تحرّك المضرب. انقر للإطلاق. حطّم كل الطوب — لديك ثلاث كرات.', game_arkanoid_stat: 'المستوى', game_hint: 'الأسهم أو السحب.' },
  hu: { game_snake_name: 'Kígyó', game_snake_hint: 'Nyilak vagy húzás a kanyarodáshoz. Az étel hosszabbá és gyorsabbá teszi; a fal vagy a saját teste véget vet a játéknak.', game_snake_stat: 'Hossz', game_score: 'Pontszám', game_best: 'Rekord', game_new: 'Új játék', game_over: 'Nincs több lépés', game_win: 'Kész! 🎉', game_2048_win: '2048! 🎉', game_continue: 'Tovább játszom', game_2048_hint: 'A nyilak vagy a húzás az egész táblát mozgatja. Az azonos lapkák összeolvadnak.', game_2048_name: '2048', game_15_name: 'Tologatós', game_15_hint: 'A nyilak vagy a húzás az üres mezőbe tolnak egy lapkát. Cél: 1–15 sorrend.', game_mines_name: 'Aknakereső', game_mines_hint: 'A kattintás felfed egy mezőt, a hosszú nyomás vagy jobb klikk zászlót tesz. A szám a szomszédos aknák száma.', game_gems_name: 'Három egy sorban', game_gems_hint: 'Kattints két szomszédos kőre a cseréhez. Három egyforma egy sorban eltűnik.', game_lines_name: 'Vonalak', game_lines_hint: 'Válassz egy golyót, majd egy üres mezőt. Öt egy sorban eltűnik; különben három új golyó jön.', game_flow_name: 'Kösd össze a pontokat', game_flow_hint: 'Húzz az egyik ponttól a párjáig. Az utak nem keresztezhetik egymást.', game_flow_stat: 'Szint', game_dice_name: 'Kockák', game_dice_hint: 'Tippeld meg a két kocka összegét, majd dobj. A pontszám a találatok száma.', game_dice_guess: 'A tipped', game_dice_roll: 'Dobás', game_dice_hit: 'Talált!', game_dice_miss: 'Nem talált', game_dice_stat: 'Dobások', game_coin_name: 'Érme', game_coin_hint: 'Válassz oldalt, majd dobd fel az érmét. A pontszám a találatok száma.', game_coin_guess: 'A tipped', game_coin_flip: 'Feldobás', game_coin_stat: 'Dobások', game_coin_heads: 'Fej', game_coin_tails: 'Írás', game_ttt_name: 'Amőba', game_ttt_hint: 'Te vagy a ✕. Három egy sorban nyer. A gép erősen játszik, de villával legyőzhető.', game_ttt_over: 'Vége a partinak', game_dots_name: 'Pontok', game_dots_stat: 'Lépések', game_dots_hint: 'Húzz végig azonos színű szomszédos pontokon — engedd el, és eltűnnek. A zárt hurok az adott szín összes pontját eltünteti.', game_strings_name: 'Húzd meg a vonalakat', game_strings_hint: 'Húzz vonalat az egyik ponttól az azonos színű párjáig. A vonalak nem keresztezhetik egymást és nem léphetnek ki a körből.', game_strings_stat: 'Szint', game_untangle_name: 'Bogozd ki', game_untangle_cross: 'Keresztezések:', game_untangle_hint: 'Húzd a pontokat, amíg egyetlen vonal sem keresztezi a másikat.', game_arkanoid_name: 'Arkanoid', game_arkanoid_launch: 'Kattints az indításhoz', game_arkanoid_hint: 'Az egér vagy a ← → mozgatja az ütőt. Kattints az indításhoz. Törd össze az összes téglát — három labdád van.', game_arkanoid_stat: 'Szint', game_hint: 'Nyilak vagy húzás.' },
};
// мова гаспадара (панэль — adminLang, сайт — currentUiLang); фолбэк — англійская
function _gLang() {
  const h = window.TTZOP_GAMES_HOST;
  let l = '';
  try { l = (h && typeof h.lang === 'function') ? h.lang() : ''; } catch {}
  return _GAMES_I18N[l] ? l : 'en';
}
// публічны чытач слоўніка: гаспадар можа перакрыць надпіс сваім `t()`, інакш бярэцца адсюль
window.TTZOP_GAMES_T = key => (_GAMES_I18N[_gLang()] || {})[key] || '';
function _gT(key) {
  const h = window.TTZOP_GAMES_HOST;
  let v = '';
  try { v = (h && typeof h.t === 'function') ? h.t(key) : ''; } catch {}
  if (!v || v === key) v = window.TTZOP_GAMES_T(key);                  // гаспадар не ведае ключа → уласны слоўнік
  return v || key;
}

// Пер-гульнявы надпіс з фолбэкам на агульны: `game_15_hint` → `game_hint`. Правілы ў кожнай гульні
// свае, і адзін агульны тэкст («роўныя пліткі зліваюцца») хлусіў бы ўсім, акрамя 2048.
function _gTGame(gameId, suffix) {
  const own = _gT(`game_${gameId}_${suffix}`);
  return (own && own !== `game_${gameId}_${suffix}`) ? own : _gT(`game_${suffix}`);
}

// ── стан УСІХ змантаваных гульняў: ключ = id кантэйнера (адна старонка можа несці некалькі) ──
const _gameStates = {};
// 🎯 «АКТЫЎНАЯ» дошка — заўвага карыстальніка 30.07: адкрыты Арканоід + Пінбол разам на старонцы,
// стрэлкі кіравалі АБОДВУМА адразу (кожная дошка правярала толькі бачнасць, не тое, ці менавіта яна
// ў фокусе). hostId той дошкі, па якой апошні раз клікнулі/тапнулі; клавіятура слухае толькі яе.
let _gamesFocused = null;
// 🎯 АДЗІНЫ ЎВАХОД У ФОКУС ДОШКІ — і для рухавіка (клік па дошцы), і для гаспадара.
// ⚠️ Заўвага карыстальніка 30.07: «пакуль не клікну мышкай па дошцы, клавіятура кіруе дошкай у
// ІНШАЙ Форме, хоць рамка візуальна на гэтай». Прычына — ДЗВЕ крыніцы праўды: у панэлі актыўны
// вузел (`s.focusedId`, рамка), у рухавіку `_gamesFocused` (апошні клік). Пакуль дошкі згортваліся
// акардэонам, разыходжанне хавалася; як толькі Формы-Гульні сталі незалежныя — вылезла.
// Цяпер праўда адна: хто валодае вузлом, той і кажа рухавіку — панэль клiча `gamesFocus` пасля
// кожнага рэндэру па сваім `focusedId`. Рухавік па-ранейшаму НЕ ведае пра панэль (кантракт-функцыя).
function gamesFocus(hostId) {
  if (!hostId || !document.getElementById(hostId)) return false;   // чужы/неіснуючы вузел — не чапаем
  _gamesFocused = hostId;
  return true;
}
// адна-адзіная бачная дошка кіруецца заўсёды (клавіятура «проста працуе», клік не патрэбны)
function _gamesRetuneSole() {
  const vis = Object.keys(_gameStates).map(id => document.getElementById(id)).filter(el => el && _gamesVisible(el));
  if (vis.length === 1) _gamesFocused = vis[0].id;
}

// 🏆 рэкорд — пер-гульнявы. Дзе ён ЛЯЖЫЦЬ, вырашае ГАСПАДАР: панэль дае `bestGet/bestSet` і кладзе
// рэкорд у асабістыя налады чалавека (ідуць за ім на любую прыладу — заўвага 30.07); публічны сайт
// такога кантракту не дае, і там застаецца localStorage. Рухавік пра сховішча не ведае — гэта не
// яго справа: ён проста пытае гаспадара, а сам умее толькі «нічога няма».
function _gameBestGet(id) {
  const h = window.TTZOP_GAMES_HOST;
  if (h && typeof h.bestGet === 'function') { try { return h.bestGet(id) || 0; } catch {} }
  try { return parseInt(localStorage.getItem('ttzop_game_best_' + id)) || 0; } catch { return 0; }
}
function _gameBestSet(id, v) {
  const h = window.TTZOP_GAMES_HOST;
  if (h && typeof h.bestSet === 'function') { try { h.bestSet(id, v); return; } catch {} }
  try { localStorage.setItem('ttzop_game_best_' + id, String(v)); } catch {}
}

// ═══════════════════════════════════════════════════════════════
// КАТАЛОГ ГУЛЬНЯЎ — новая гульня = адзін запіс (рухавік не чапаецца)
// Кантракт запісу (усё, акрамя size/init/cellHtml, — неабавязковае):
//   size            памер боку сеткі
//   init(st)        пачатковы стан: st.grid, st.score, st.over, st.won
//   cellHtml(v,pop,i,st) HTML ячэйкі (pop = значэнне змянілася з мінулай перамалёўкі; i — індэкс,
//                   st — стан: трэба тым, хто малюе ВЫЛУЧЭННЕ (выбраны дыямент/шар))
//   move(st,dir)    ход стрэлкай/свайпам → bool «поле змянілася»
//   onCell(st,i)    клік па ячэйцы → bool «поле змянілася»
//   onCellAlt(st,i) альтэрнатыўнае дзеянне (правы клік / доўгі тап) → bool
//   onCellEnter(st,i) палец/мыш ПРАЙШЛІ праз ячэйку з націснутай кнопкай (маляванне шляху) → bool
//   onCellUp(st)    адпусцілі (завяршэнне шляху) → bool
//   lowerIsBetter   рэкорд = меншы рахунак (пятнашкі: менш хадоў)
//   noBurst         не дамалёўваць «лопанне» на апусцелых ячэйках (гл. заўвагу ў `_gamesPaint`:
//                   у слайд-гульнях, дзе значэнне ПЕРАЯЗДЖАЕ ў іншую ячэйку (2048, пятнашкі),
//                   рухавік не можа адрозніць «пераехала» ад «знікла» — толькі здымак поля да/пасля
//   nextLevel(st)   неабавязковы хук складанасці: калі ёсць, кнопка «Гуляць далей» на банеры
//                   перамогі не проста хавае банер (як у 2048), а просіць гульню пабудаваць
//                   складанейшы расклад (`st.level` рухавік ужо павялічыў) і партыя працягваецца
//  ── рэжым ПАЛАТНА (mode:'canvas') — для таго, што не кладзецца на сетку ──
//   draw(st,ctx,w,h)  малюнак кадра (каардынаты ў пікселях палатна)
//   tick(st,dt)       фізіка/анімацыя; наяўнасць `tick` уключае кадравы цыкл → bool «перамаляваць»
//   onPoint(st,x,y,phase) увод у долях палатна (0..1), phase = 'down'|'move'|'up' → bool
// Рухавік сам вырашае, ЯКІ ўвод падключаць: ёсць `move` → стрэлкі і свайп; ёсць `onCell` → клікі;
// mode:'canvas' → палатно, паказальнік і (пры `tick`) кадравы цыкл.
// Гульня ніколі не чапае DOM і не ведае пра тэму, мову і перамалёўкі.
// ═══════════════════════════════════════════════════════════════
const GAMES = {
  // 2048 — класічныя правілы: свайп/стрэлка ссоўвае ўсё, роўныя суседзі зліваюцца адзін раз за ход.
  '2048': {
    size: 4,
    goal: 2048,
    noBurst: true, // плітка пры звычайным ходзе ПЕРАЯЗДЖАЕ ў суседнюю ячэйку — гэта не «знікненне»
    init(st) {
      st.grid = Array.from({ length: 16 }, () => 0);
      st.score = 0; st.over = false; st.won = false; st._merged = new Set();
      _g2048Spawn(st); _g2048Spawn(st);
    },
    // ⚠️ Заўвага карыстальніка 30.07 («анімацыі зусім няма»): да гэтага «анімацыяй» БЫЎ агульны
    // `tg-burst` на кожнай апусцелай ячэйцы — семантычна няправільна (плітка проста ПЕРАЯЗДЖАЛА,
    // не знікала), таму яго і адключылі праз `noBurst`. Без яго засталося толькі ціхае `tg-pop`
    // на ячэйках, чыё значэнне змянілася, — амаль незаметнае. Тут гульня яўна кажа рухавіку, ЯКІЯ
    // ячэйкі гэтым ходам сапраўды ЗЛІЛІСЯ (`st._merged`), і рухавік дае ім прыкметнейшую анімацыю
    // (гл. `.tg-merge` у стылях і `cellHtml` ніжэй) — менавіта тое, пра што прасіў карыстальнік.
    move(st, dir) {
      const before = st.grid.join(',');
      const lines = _g2048Lines(dir);
      st._merged = new Set();
      lines.forEach(idx => {
        const vals = idx.map(i => st.grid[i]).filter(v => v);      // сціснуць, прыбраўшы пустэчу
        for (let i = 0; i < vals.length - 1; i++) {
          if (vals[i] === vals[i + 1]) {                            // зліццё — адзін раз на пару за ход
            vals[i] *= 2; st.score += vals[i];
            st._merged.add(idx[i]);                                 // менавіта СЮДЫ трапіла зліццё
            if (vals[i] >= GAMES['2048'].goal) st.won = true;
            vals.splice(i + 1, 1);
          }
        }
        idx.forEach((cell, k) => { st.grid[cell] = vals[k] || 0; });
      });
      const moved = st.grid.join(',') !== before;
      if (moved) { _g2048Spawn(st); st.over = !_g2048CanMove(st); }
      return moved;
    },
    // колер плітак — з акцэнту тэмы: чым большая ступень, тым шчыльнейшы фон.
    // Ніякіх зашытых #eee4da — інакш гульня выпадае з тэмы панэлі (і з цёмнага рэжыму).
    cellHtml(v, pop, i, st) {
      if (!v) return `<div class="tg-cell tg-empty"></div>`;
      const step = Math.min(Math.log2(v), 11) / 11;                 // 2..2048+ → 0..1
      const fs = v >= 1024 ? '1.05rem' : v >= 128 ? '1.25rem' : '1.5rem';
      // тая ж лагіка, што вядзе `pop` у рухавіку: на слабой машыне анімацыя глушыцца зусім
      const merged = st._merged?.has(i) && !_gamesPerfWeak();
      return `<div class="tg-cell${merged ? ' tg-merge' : (pop ? ' tg-pop' : '')}" style="background:color-mix(in srgb, var(--accent) ${Math.round(14 + step * 76)}%, var(--surface));`
        + `color:${step > 0.45 ? '#fff' : 'var(--text)'};font-size:${fs}">${v}</div>`;
    },
  },
  // 15 — пятнашкі. Другі запіс каталога, дададзены дзеля праверкі, што рухавік сапраўды агульны:
  // ніводнага радка рухавіка правіць не давялося. Рахунак тут — лік хадоў (чым меней, тым лепш),
  // таму «рэкорд» лічыцца ад адваротнага — гл. `lowerIsBetter`.
  '15': {
    size: 4,
    lowerIsBetter: true,
    noBurst: true, // тое ж, што ў 2048: плітка едзе ў пустую ячэйку, а не знікае
    init(st) {
      // тасуем ТОЛЬКІ законнымі хадамі ад сабранага стану — інакш палова раскладаў не мае рашэння
      st.grid = [...Array(15).keys()].map(i => i + 1).concat(0);
      st.score = 0; st.over = false; st.won = false;
      for (let i = 0; i < 200; i++) {
        const dirs = ['left', 'right', 'up', 'down'];
        _p15Slide(st, dirs[Math.floor(Math.random() * 4)]);
      }
      st.score = 0;                                                  // хады тасавання не лічым
    },
    move(st, dir) {
      if (!_p15Slide(st, dir)) return false;
      st.score++;
      if (st.grid.every((v, i) => (i === 15 ? v === 0 : v === i + 1))) { st.won = true; st.over = true; }
      return true;
    },
    cellHtml(v, pop) {
      if (!v) return `<div class="tg-cell tg-empty"></div>`;
      const step = v / 15;
      return `<div class="tg-cell${pop ? ' tg-pop' : ''}" style="background:color-mix(in srgb, var(--accent) ${Math.round(18 + step * 60)}%, var(--surface));`
        + `color:${step > 0.5 ? '#fff' : 'var(--text)'};font-size:1.35rem">${v}</div>`;
    },
  },
  // 💣 Сапёр — першая гульня на КЛІКУ (клік адкрывае, доўгі тап/правы клік ставіць сцяжок).
  // Рахунак = адкрытыя бяспечныя ячэйкі; перамога — калі адкрыты ўсе.
  mines: {
    size: 9,
    bombs: 10,
    init(st) {
      st.grid = Array.from({ length: 81 }, () => ({ m: 0, r: 0, f: 0, n: 0 }));
      st.score = 0; st.over = false; st.won = false; st._seeded = false;
    },
    onCell(st, i) {
      const c = st.grid[i];
      if (c.r || c.f) return false;
      if (!st._seeded) _mineSeed(st, i);                              // міны раскладаем ПАСЛЯ першага кліку — інакш можна прайграць першым жа тыкам
      if (c.m) { st.grid.forEach(x => { if (x.m) x.r = 1; }); st.over = true; return true; }
      _mineOpen(st, i);
      st.score = st.grid.filter(x => x.r && !x.m).length;
      if (st.score === 81 - GAMES.mines.bombs) { st.won = true; st.over = true; }
      return true;
    },
    onCellAlt(st, i) {
      const c = st.grid[i];
      if (c.r) return false;
      c.f = c.f ? 0 : 1;
      return true;
    },
    cellHtml(c, pop) {
      if (!c.r) return `<div class="tg-cell tg-hidden${pop ? ' tg-pop' : ''}">${c.f ? '⚑' : ''}</div>`;
      if (c.m) return `<div class="tg-cell tg-mine">✳</div>`;
      // лічба суседзяў — колер ад «спакойнага» да трывожнага праз акцэнт тэмы
      return `<div class="tg-cell tg-open" style="color:${c.n ? `color-mix(in srgb, var(--error) ${c.n * 16}%, var(--accent))` : 'transparent'}">${c.n || '·'}</div>`;
    },
  },
  // 💎 Тры ў рад — клік па двух суседніх мяняе іх месцамі, супадзенні знікаюць, верхнія падаюць.
  gems: {
    size: 8,
    colors: 6,
    init(st) {
      do { st.grid = Array.from({ length: 64 }, () => 1 + Math.floor(Math.random() * 6)); }
      while (_gemMatches(st).size);                                   // старт без гатовых радоў — інакш ачкі капаюць самі
      st.score = 0; st.over = false; st.won = false; st._sel = -1;
    },
    onCell(st, i) {
      if (st._sel < 0) { st._sel = i; return true; }
      if (st._sel === i) { st._sel = -1; return true; }
      const a = st._sel, b = i;
      const adj = Math.abs(a % 8 - b % 8) + Math.abs(Math.floor(a / 8) - Math.floor(b / 8)) === 1;
      st._sel = -1;
      if (!adj) return true;
      [st.grid[a], st.grid[b]] = [st.grid[b], st.grid[a]];
      if (!_gemMatches(st).size) { [st.grid[a], st.grid[b]] = [st.grid[b], st.grid[a]]; return true; } // ход без супадзення — адкат
      _gemResolve(st);
      return true;
    },
    cellHtml(v, pop, i, st) {
      if (!v) return `<div class="tg-cell tg-empty"></div>`;
      return `<div class="tg-cell${pop ? ' tg-pop' : ''}${st._sel === i ? ' tg-sel' : ''}" style="background:${_gColor(v, 6)};color:var(--text);font-size:1.1rem">◆</div>`;
    },
  },
  // 🔴 Лініі — выбраў шар, клікнуў пусты: калі ёсць шлях, шар едзе. Пяць у рад (любы кірунак) знікаюць.
  // Не сабраў — тры новыя шары; поле запоўнілася — канец.
  lines: {
    size: 9,
    init(st) {
      st.grid = Array.from({ length: 81 }, () => 0);
      st.letters = {};                                                // індэкс → 'T'/'Z'/'O'/'P' (заўвага карыстальніка 30.07)
      st.score = 0; st.over = false; st.won = false; st._sel = -1;
      _linesSpawn(st, 5);
    },
    onCell(st, i) {
      if (st.grid[i]) { st._sel = i; return true; }                   // клік па шары — выбар (у т.л. перавыбар)
      if (st._sel < 0) return false;
      if (!_linesPath(st, st._sel, i)) return true;                   // шляху няма — проста знімаем нічога
      st.grid[i] = st.grid[st._sel]; st.grid[st._sel] = 0;
      if (st.letters[st._sel]) { st.letters[i] = st.letters[st._sel]; delete st.letters[st._sel]; } // літара едзе з шарам
      st._sel = -1;
      if (!_linesClear(st, i) && !_linesLetterBonus(st)) {            // сабраў лінію → новыя шары НЕ падаюць (класічнае правіла)
        _linesSpawn(st, 3);
        if (!st.grid.includes(0)) st.over = true;
      }
      return true;
    },
    cellHtml(v, pop, i, st) {
      if (!v) return `<div class="tg-cell tg-empty"></div>`;
      const L = st.letters[i];
      // 🔤 брэндаваны шар (заўвага карыстальніка 30.07): T×2 + Z + O + P на дошцы адначасова —
      // асобны бонус-выйгрыш (гл. `_linesLetterBonus`), незалежны ад звычайнага «пяць у рад».
      // Літара кладзецца НА КОЛЕР шара, не замест яго — гэта ўсё яшчэ звычайны гулявы шар.
      return `<div class="tg-cell${pop ? ' tg-pop' : ''}${st._sel === i ? ' tg-sel' : ''}" style="background:transparent">`
        // 90% замест 72% (заўвага карыстальніка 30.07: «зрабіць большым, наколькі клетка дазваляе») —
        // клеткі і так стаяць з зазорам `gap` у `.tg-board`, суседнія шары не дакрануцца
        + `<span style="display:flex;align-items:center;justify-content:center;width:90%;height:90%;border-radius:50%;background:${_gColor(v, 7)}">`
        + (L ? `<b style="color:#fff;font-size:0.85rem;text-shadow:0 1px 2px rgba(0,0,0,.6)">${L}</b>` : '') + `</span></div>`;
    },
  },
  // 🔗 Злучы пункты — правядзі шлях ад кропкі да яе пары, не перасякаючы чужыя. Сетка + ДРАГ.
  flow: {
    size: 6,
    pairs: 4,
    init(st) {
      st.score = 0; st.over = false; st.won = false; st.level = 1;
      _flowBuild(st);
    },
    stat: st => st.level,
    // 🏔 Складанасць узроўняў (заўвага карыстальніка 30.07): разгадаў — не канец, а «Гуляць далей»
    // (той жа банер-механізм, што ў 2048/Арканоіда). Наступны ўзровень дадае яшчэ адну пару кропак,
    // максімум 7 — болей на сетцы 6×6 шляхі рэгулярна не змяшчаюцца (гл. `_flowBuild`/`_flowCarve`).
    nextLevel(st) { _flowBuild(st); },
    onCell(st, i) { return _flowStart(st, i); },                      // кароткі тап па кропцы — таксама пачатак
    onCellEnter(st, i) {
      if (!st._draw) return _flowStart(st, i);
      const last = st._path[st._path.length - 1];
      if (i === last) return false;
      const adj = Math.abs(i % 6 - last % 6) + Math.abs(Math.floor(i / 6) - Math.floor(last / 6)) === 1;
      if (!adj) return false;                                          // палец пераскочыў — шлях не рвём, чакаем суседнюю
      const c = st.grid[i];
      if (st._path.length > 1 && i === st._path[st._path.length - 2]) { // задні ход — сціраем хвост
        st.grid[last].p = st.grid[last].d ? st.grid[last].p : 0;
        if (!st.grid[last].d) st.grid[last].p = 0;
        st._path.pop();
        return true;
      }
      if (c.d && c.d !== st._draw) return false;                       // чужая кропка — тупік
      if (c.p && c.p !== st._draw) return false;                       // чужы шлях — не перасякаем
      c.p = st._draw; st._path.push(i);
      if (c.d === st._draw) { st._draw = 0; _flowCheck(st); }          // дайшлі да пары
      return true;
    },
    onCellUp(st) { if (!st._draw) return false; st._draw = 0; return true; },
    cellHtml(c, pop, i, st) {
      const col = c.d || c.p;
      const n = st.pairs || 4;
      const bg = c.p ? `color-mix(in srgb, ${_gColor(c.p, n, true)} 34%, var(--surface))` : 'var(--surface)';
      return `<div class="tg-cell${pop ? ' tg-pop' : ''}" style="background:${bg}">`
        + (c.d ? `<span style="display:block;width:62%;height:62%;border-radius:50%;background:${_gColor(c.d, n)}"></span>` : '') + `</div>`;
    },
  },
  // 🕸 Распутай лініі — класічная «planarity»: перацягвай кропкі, пакуль ніводная лінія не
  // перасякае іншую. ⚠️ Была версія «клікні дзве кропкі → прамая хорда»: карыстальнік слушна
  // сказаў, што сэнс губляецца — клікі па парах гэта не гульня, а мышкай нічога не малявалася.
  // Цяпер драг сапраўдны: рухаеш ТОЧКІ, а не малюеш лініі, і мэта відавочная — прыбраць скрыжаванні.
  untangle: {
    mode: 'canvas',
    size: 1,
    lowerIsBetter: true,                                               // рахунак = перацягванняў; чым меней, тым лепш
    init(st) { _untBuild(st); },
    // 🏔 «Гуляць далей» → больш кропак (рухавік сам павялічвае st.level перад выклікам)
    nextLevel(st) { _untBuild(st); },    onPoint(st, x, y, phase) {
      if (st.over) return false;
      if (phase === 'down') {
        st._grab = _untHit(st, x, y);
        return st._grab >= 0;
      }
      if (phase === 'move') {
        if (st._grab < 0) return false;
        st.dots[st._grab].x = Math.min(0.96, Math.max(0.04, x));       // не даем зацягнуць кропку за край
        st.dots[st._grab].y = Math.min(0.96, Math.max(0.04, y));
        _untCount(st);
        return true;
      }
      if (st._grab < 0) return false;
      st._grab = -1; st.score++;                                       // перацягванне залічваецца ў канцы, а не на кожны піксель
      if (!st.cross) { st.won = true; st.over = true; }
      return true;
    },
    draw(st, ctx, w, h) {
      const P = i => [st.dots[i].x * w, st.dots[i].y * h];
      st.edges.forEach(([a, b], i) => {
        ctx.lineWidth = st.bad.has(i) ? 3 : 2;
        ctx.strokeStyle = st.bad.has(i) ? _gCss('--error', '#e5484d') : _gCss('--muted', '#888');
        ctx.beginPath(); ctx.moveTo(...P(a)); ctx.lineTo(...P(b)); ctx.stroke();
      });
      st.dots.forEach((d, i) => {
        ctx.fillStyle = i === st._grab ? _gCss('--text', '#fff') : _gCss('--accent', '#6aa9ff');
        ctx.beginPath(); ctx.arc(d.x * w, d.y * h, i === st._grab ? 0.032 * w : 0.026 * w, 0, 7); ctx.fill();
      });
      // лічба скрыжаванняў — адзіны паказчык прагрэсу: без яе не зразумела, ці набліжаешся да мэты
      ctx.fillStyle = st.cross ? _gCss('--error', '#e5484d') : _gCss('--success', '#4ac26b');
      ctx.font = `600 ${Math.round(w * 0.05)}px sans-serif`;
      ctx.fillText(_gTGame('untangle', 'cross') + ' ' + st.cross, w * 0.04, h * 0.075);
    },
  },
  // 🧵 Правядзі лініі — свабодная крывая ад кропкі да кропкі таго ж колеру, лініі не перасякаюцца
  // (прапанова карыстальніка па малюнку 29.07). Адрозненне ад «Распутай лініі» прынцыповае:
  // там рухаеш КРОПКІ пры зададзеных лініях, тут малюеш ЛІНІІ пры зададзеных кропках.
  strings: {
    mode: 'canvas',
    size: 1,
    pairs: 3,
    init(st) {
      st.score = 0; st.over = false; st.won = false; st.level = 1;
      _strBuild(st);
    },
    stat: st => st.level,
    // 🏔 Складанасць узроўняў (заўвага карыстальніка 30.07: «не хапае ўзроўняў і паступовага
    // павышэння»): пар становіцца больш (3→6), мінімальная адлегласць паміж кропкамі памяншаецца,
    // каб столькі кропак увогуле змясцілася ў той жа круг — гл. `_strBuild`.
    nextLevel(st) { _strBuild(st); },
    onPoint(st, x, y, phase) {
      if (st.over) return false;
      if (phase === 'down') {
        const i = _strHit(st, x, y);
        if (i < 0 || _strDone(st, i)) return false;                    // кропка ўжо злучаная — не пачынаем
        st.from = i; st.cur = [{ x: st.dots[i].x, y: st.dots[i].y }];
        return true;
      }
      if (phase === 'move') {
        if (!st.cur) return false;
        const last = st.cur[st.cur.length - 1];
        if (Math.hypot(x - last.x, y - last.y) < 0.012) return false;  // радзеем кропкі: інакш крывая з тысяч звёнаў, і праверка перасячэнняў душыць CPU
        st.cur.push({ x, y });
        return true;
      }
      // адпусцілі: лінія залічваецца толькі калі скончылася на ПАРЫ таго ж колеру,
      // не вылезла за круг і нікога не перасекла. Інакш проста знікае — без папроку.
      const cur = st.cur, from = st.from;
      st.cur = null; st.from = -1;
      if (!cur || from < 0) return true;
      const j = _strHit(st, x, y);
      if (j < 0 || j === from || st.dots[j].c !== st.dots[from].c || _strDone(st, j)) return true;
      cur.push({ x: st.dots[j].x, y: st.dots[j].y });
      if (_strOutside(cur) || _strCrosses(st, cur)) return true;
      st.paths.push({ c: st.dots[from].c, pts: cur, a: from, b: j });
      st.score += 100;
      if (st.paths.length === st.pairs) st.won = true;                // over застаецца false — «Гуляць далей» вядзе да nextLevel
      return true;
    },
    draw(st, ctx, w, h) {
      ctx.lineJoin = ctx.lineCap = 'round';
      ctx.strokeStyle = _gCss('--border', '#555'); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0.5 * w, 0.5 * h, 0.44 * w, 0, 7); ctx.stroke();
      const line = (pts, col, wid) => {
        ctx.strokeStyle = col; ctx.lineWidth = wid;
        ctx.beginPath(); ctx.moveTo(pts[0].x * w, pts[0].y * h);
        pts.forEach(p => ctx.lineTo(p.x * w, p.y * h));
        ctx.stroke();
      };
      st.paths.forEach(p => line(p.pts, _gColor(p.c, st.pairs, true), 0.03 * w));
      if (st.cur && st.cur.length > 1) line(st.cur, _gColor(st.dots[st.from].c, st.pairs, true), 0.022 * w);
      st.dots.forEach(d => {
        ctx.fillStyle = _gColor(d.c, st.pairs, true);
        ctx.beginPath(); ctx.arc(d.x * w, d.y * h, 0.035 * w, 0, 7); ctx.fill();
      });
    },
  },
  // 🔵 Кропкі — вядзеш ланцужок па СУСЕДНІХ кропках аднаго колеру, адпусціў → яны знікаюць,
  // верхнія падаюць, зверху сыплюцца новыя. Ходы абмежаваныя (прапанова карыстальніка па малюнку).
  // Кладзецца на ўжо гатовы драг-па-ячэйках («Злучы пункты») — рухавік не чапаўся зусім.
  dots: {
    size: 6,
    moves: 20,
    init(st) {
      st.grid = Array.from({ length: 36 }, () => 1 + Math.floor(Math.random() * 5));
      st.score = 0; st.over = false; st.won = false; st.moves = 20; st.chain = []; st.loop = false;
    },
    stat: st => st.moves,
    chain: st => st.chain,                                             // 🖍 рухавік намалюе лінію па ланцужку
    onCell(st, i) { st.chain = [i]; st.loop = false; return true; },   // кароткі тап — пачатак ланцужка
    onCellEnter(st, i) {
      if (!st.chain.length) { st.chain = [i]; return true; }
      const last = st.chain[st.chain.length - 1];
      if (i === last) return false;
      if (st.grid[i] !== st.grid[last]) return false;                  // іншы колер — не працягваем
      const adj = Math.abs(i % 6 - last % 6) + Math.abs(Math.floor(i / 6) - Math.floor(last / 6)) === 1;
      if (!adj) return false;
      if (st.chain.length > 1 && i === st.chain[st.chain.length - 2]) { st.chain.pop(); return true; } // задні ход
      // 🔁 замкнулі кола — класічнае правіла: знікаюць УСЕ кропкі гэтага колеру, а не толькі ланцужок
      if (st.chain.includes(i)) { st.loop = true; st.chain.push(i); return true; }
      st.chain.push(i);
      return true;
    },
    onCellUp(st) {
      const ch = st.chain; st.chain = [];
      if (!ch.length) return false;
      const col = st.grid[ch[0]];
      const kill = st.loop ? st.grid.map((v, i) => v === col ? i : -1).filter(i => i >= 0) : [...new Set(ch)];
      st.loop = false;
      if (kill.length < 2) return true;                                // адна кропка — не ход
      st.score += kill.length * kill.length;                           // доўгі ланцужок каштуе непрапарцыйна больш
      kill.forEach(i => { st.grid[i] = 0; });
      st.moves--;
      st._pending = s => { _dotsDrop(s); if (!s.moves) { s.over = true; } return true; }; // паказваем пустэчу, потым падзенне
      return true;
    },
    cellHtml(v, pop, i, st) {
      if (!v) return `<div class="tg-cell tg-empty"></div>`;
      // ⚠️ Ячэйкі ланцужка НЕ падсвечваюцца (заўвага карыстальніка 30.07: «пакінь толькі лінію»):
      // лінія ўжо паказвае шлях, а другая падказка на тых жа кропках толькі мітусілася пад рукой.
      return `<div class="tg-cell${pop ? ' tg-pop' : ''}" style="background:transparent">`
        + `<span style="display:block;width:70%;height:70%;border-radius:50%;background:${_gColor(v, 5)}"></span></div>`;
    },
  },
  // ❌⭕ Ружыкі-нулікі — самая маленькая гульня каталога і найлепшая праверка кантракту:
  // сетка 3×3, адзін хук `onCell`, нуль новага кода ў рухавіку.
  ttt: {
    size: 3,
    init(st) {
      st.grid = Array.from({ length: 9 }, () => 0);                    // 0 пуста · 1 гулец ✕ · 2 машына ◯
      st.score = 0; st.over = false; st.won = false; st.result = '';
    },
    onCell(st, i) {
      if (st.grid[i]) return false;
      st.grid[i] = 1;
      if (_tttWin(st.grid, 1)) { st.won = true; st.over = true; st.score = 100; return true; }
      if (!st.grid.includes(0)) { st.over = true; return true; }       // нічыя
      st.grid[_tttReply(st.grid)] = 2;
      if (_tttWin(st.grid, 2)) { st.over = true; return true; }
      if (!st.grid.includes(0)) st.over = true;
      return true;
    },
    // ⚠️ Заўвага карыстальніка 30.07: раней пазнака малявалася шрыфтам (`font-size:2rem`) — фіксаваны
    // памер не залежаў ад таго, наколькі буйная клетка на экране, і на вялікіх дошках ✕/◯ гублялiся.
    // SVG маштабуецца разам з клеткай (78% яе памеру заўсёды), незалежна ад шырыні экрана.
    cellHtml(v, pop) {
      if (!v) return `<div class="tg-cell${pop ? ' tg-pop' : ''}" style="background:var(--surface)"></div>`;
      const col = v === 1 ? _gColor(1, 3) : _gColor(2, 3);
      const mark = v === 1
        ? `<path d="M18 18L82 82M82 18L18 82" stroke="${col}" stroke-width="13" stroke-linecap="round" fill="none"/>`
        : `<circle cx="50" cy="50" r="33" stroke="${col}" stroke-width="13" fill="none"/>`;
      return `<div class="tg-cell${pop ? ' tg-pop' : ''}" style="background:var(--surface)">`
        + `<svg viewBox="0 0 100 100" style="width:78%;height:78%">${mark}</svg></div>`;
    },
  },
  // 🎲 КУБІКІ — ізаметрычныя, як наш Куб: тры бачныя грані, кідок круціць іх і спыняе.
  // Плюс гульнявы сэнс, а не проста генератар лічбаў: ПЕРАД кідком выбіраеш прагноз сумы,
  // рахунак = колькі разоў угадаў (прапанова карыстальніка).
  dice: {
    mode: 'canvas',
    size: 1,
    // 🎲 Рэжым 1/2/3 кубікі (заўвага карыстальніка 30.07). `st.n` — колькі косцяў, `st.dice` —
    // іх значэнні (агульны масіў замест ранейшых асобных `a`/`b`, каб не заводзіць 3-і пераменную
    // пад тое ж самае). Дыяпазон прагнозу і сам вылічаецца ад `n` (`_diceRange`), а не зашыты 2..12.
    init(st) {
      st.grid = []; st.score = 0; st.over = false; st.won = false;
      st.n = _diceLoadMode();
      st.dice = Array.from({ length: st.n }, () => 1);
      st.rot = Array(st.n).fill(0);
      st.rolls = 0; st.guess = 0; st.t = 0; st.spin = 0; st.last = ''; st.fly = 0;
    },
    stat: st => st.rolls,
    onPoint(st, x, y, phase) {
      if (phase !== 'down') return false;
      const m = _diceModeAt(x, y);
      if (m && st.spin === 0) {                                        // рэжым мяняецца толькі ў спакоі
        if (m !== st.n) {
          st.n = m; _diceSaveMode(m); st.dice = Array.from({ length: m }, () => 1); st.rot = Array(m).fill(0);
          st.guess = 0; st.last = ''; st.rolls = 0; st.score = 0;      // новы дыяпазон — стары прагноз/рахунак ужо не пра тое
        }
        return true;
      }
      if (st.spin > 0) return false;
      const g = _diceGuessAt(x, y, st);
      if (g) { st.guess = (st.guess === g) ? 0 : g; return true; }     // паўторны тык па той жа лічбе здымае прагноз
      _diceStart(st);
      return true;
    },
    // ⚠️ Заўвага карыстальніка 30.07 (двойчы): спачатку «дрыгаецца, а не круціцца» — потым, пасля
    // спробы squash-кручэння, «зараз відавочна прыплюснутыя фігуры, а не кубікі, і ўсё роўна
    // дрыгаюцца». Squash (сцісканне па шырыні) псаваў іменна геаметрыю куба — прапанова
    // карыстальніка: рабіць як у Манеты (падкідванне, кручэнне, падзенне). Цяпер тая ж мадэль:
    // `st.fly` — дуга ўзлёту (сінус ад прагрэсу кідка, той самы прыём), `st.rot` — 2D-кручэнне
    // ЎСЁЙ выявы куба (не яго асобных граняў — куб застаецца кубам, не сплюшчваецца). Грані
    // мяняюцца ўсё радзей — быццам кубік тармозіць і кладзецца на выпадковы бок.
    tick(st, dt) {
      if (!st.spin) return false;                                      // нічога не рухаецца — кадр не перамалёўваем
      st.spin = Math.max(0, st.spin - dt);
      st.t += dt;
      const p = 1 - st.spin / 900;                                     // 0..1 па ходзе кідка
      st.fly = Math.sin(p * Math.PI);                                  // дуга падкідвання, як у манеты
      // кожная костка кружыцца ЎЛАСНЫМ напрамкам/хуткасцю (`_diceStart`) — не адным супольным вуглом
      st.rot = st.rot.map((r, k) => r + dt * 0.01 * (1 - p * 0.85) * st.rotSpeed[k] * st.rotDir[k]);
      if (st.spin > 0) {                                              // круцім: грані мяняюцца ўсё радзей — быццам кубік тармозіць
        if (st.t > 90 - st.spin / 26) { st.t = 0; st.dice = st.dice.map(() => 1 + Math.floor(Math.random() * 6)); }
        return true;
      }
      st.rot = st.rot.map(() => 0); st.fly = 0;                        // спыніліся — кубікі стаяць роўна, грані чытэльныя
      st.dice = st.dice.map(() => 1 + Math.floor(Math.random() * 6));
      st.rolls++;
      const sum = st.dice.reduce((a, b) => a + b, 0);
      if (st.guess) {
        const hit = st.guess === sum;
        if (hit) st.score++;
        st.last = hit ? 'hit' : 'miss';
      } else st.last = '';
      st.guess = 0;
      return true;
    },
    draw(st, ctx, w, h) {
      const acc = _gCss('--accent', '#6aa9ff'), txt = _gCss('--text', '#fff'), mut = _gCss('--muted', '#888');
      ctx.textAlign = 'center';
      // ⚙️ рэжым: 1/2/3 кубікі — маленькі пераключальнік зверху, не блытаецца з радком прагнозу ніжэй
      [1, 2, 3].forEach(m => {
        const [cx, cy, r] = _diceModeBox(m, w, h);
        ctx.fillStyle = st.n === m ? acc : _gCss('--surface2', '#222');
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
        ctx.fillStyle = st.n === m ? '#fff' : mut;
        ctx.font = `700 ${Math.round(w * 0.028)}px sans-serif`;
        ctx.fillText(m, cx, cy + r * 0.36);
      });
      // ⚠️ Заўвага карыстальніка 30.07: надпіс «Ваш прагноз» налягаў на радок рэжыму 1/2/3 —
      // рэжым падняты і сціснуты (0.045→0.032, r 0.036→0.028), надпіс апушчаны (0.115→0.135).
      ctx.fillStyle = mut; ctx.font = `600 ${Math.round(w * 0.036)}px sans-serif`;
      ctx.fillText(_gT('game_dice_guess'), w / 2, h * 0.135);
      // 🔢 заўвага карыстальніка 30.07 («шрыфт прагнозу — у 2 разы большы»): радок з многімі
      // варыянтамі (да 16 пры трох косцях) не змясціўся б адным шэрагам буйным шрыфтам — таму
      // разбіваем на два раду, калі варыянтаў болей за 6 (гл. `_diceGuessLayout`); памер кружка
      // разлічваецца ад іх колькасці Ў РАДЗЕ, а не ад агульнай, каб пры n=1/n=2 быў сапраўды буйны.
      const L = _diceGuessLayout(st);
      for (let v = L.min; v <= L.max; v++) {
        const [cx, cy, r] = _diceGuessBox(v, st, w, h);
        ctx.fillStyle = st.guess === v ? acc : _gCss('--surface2', '#222');
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
        ctx.fillStyle = st.guess === v ? '#fff' : mut;
        ctx.font = `700 ${Math.round(r * 0.72)}px sans-serif`;
        ctx.fillText(v, cx, cy + r * 0.36);
      }
      // Узлёт-кручэнне-падзенне — той жа прыём, што ў Манеты (заўвага карыстальніка 30.07: squash
      // рабіў куб «прыплюснутым», а не аб'ёмным). `fly` падымае кубы дугой уверх; `rot` паварочвае
      // ЎСЮ выяву цалкам (не яе бакі паасобку) — геаметрыя куба не скажаецца, ён проста верціцца
      // ў плоскасці, як сапраўды падкінуты прадмет выглядае здалёк.
      const lift = st.fly * h * 0.08;
      const cy0 = h * (L.rows > 1 ? 0.65 : 0.58);                      // ніжэй, бо радок прагнозу апусцілі (0.185)
      const s = st.n === 3 ? w * 0.082 : w * 0.115;
      const xs = st.n === 1 ? [0.5] : st.n === 2 ? [0.31, 0.69] : [0.18, 0.5, 0.82];
      xs.forEach((fx, k) => {
        const cx = w * fx, cy = cy0 - lift;
        ctx.save();
        ctx.translate(cx, cy); ctx.rotate(st.rot[k]); ctx.translate(-cx, -cy); // кожная сваім напрамкам/хуткасцю
        _diceCube(ctx, cx, cy, s, st.dice[k], acc, txt);
        ctx.restore();
      });
      if (!st.spin) {                                                  // вынік кідка і ці ўгадалі
        const sum = st.dice.reduce((a, b) => a + b, 0);
        ctx.fillStyle = txt; ctx.font = `700 ${Math.round(w * 0.07)}px sans-serif`;
        ctx.fillText(sum, w / 2, h * 0.83);
        if (st.last) {
          ctx.fillStyle = st.last === 'hit' ? _gCss('--success', '#4ac26b') : mut;
          ctx.font = `600 ${Math.round(w * 0.036)}px sans-serif`;
          ctx.fillText(_gT(st.last === 'hit' ? 'game_dice_hit' : 'game_dice_miss'), w / 2, h * 0.878);
        }
      }
      ctx.fillStyle = st.spin ? mut : acc;                             // кнопка кідка
      _gRoundRect(ctx, w * 0.28, h * 0.905, w * 0.44, h * 0.075, w * 0.02); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = `600 ${Math.round(w * 0.04)}px sans-serif`;
      ctx.fillText(_gT('game_dice_roll'), w / 2, h * 0.945);
      ctx.textAlign = 'start';
    },
  },
  // 🪙 МАНЕТА — сапраўдны пераварот: манета падкідваецца і круціцца, таўшчыня рэбра мяняецца
  // па косінусе вугла. Гэта той самы прыём, што дае адчуванне аб'ёму без ніякага 3D-рухавіка.
  // Гульнявы сэнс той жа, што ў кубікаў: ПЕРАД кідком выбіраеш бок, рахунак = колькі ўгадаў.
  coin: {
    mode: 'canvas',
    size: 1,
    init(st) {
      st.grid = []; st.score = 0; st.over = false; st.won = false;
      st.rolls = 0; st.side = 0; st.guess = 0; st.ang = 0; st.spin = 0; st.fly = 0; st.last = '';
    },
    stat: st => st.rolls,
    onPoint(st, x, y, phase) {
      if (phase !== 'down' || st.spin > 0) return false;
      const g = _coinGuessAt(x, y);
      if (g) { st.guess = (st.guess === g) ? 0 : g; return true; }     // паўторны тык па тым жа боку здымае прагноз
      st.spin = 1500; st.fly = 0; st.last = '';                        // 1,5 секунды палёту з тармажэннем
      st._target = 1 + Math.floor(Math.random() * 2);                  // бок вырашаецца АДРАЗУ, анімацыя толькі паказвае
      return true;
    },
    tick(st, dt) {
      if (!st.spin) return false;
      st.spin = Math.max(0, st.spin - dt);
      const p = 1 - st.spin / 1500;                                    // 0→1 па ходзе палёту
      st.fly = Math.sin(p * Math.PI);                                  // дуга падкідвання
      st.ang += dt * 0.028 * (1 - p * 0.82);                           // кручэнне тармозіць
      if (!st.spin) {
        // ⚠️ Даводзім вугал да роўнага боку: інакш манета застыне «на рэбры» і вынік будзе нечытэльны
        st.side = st._target; st.ang = st.side === 1 ? 0 : Math.PI;
        st.fly = 0; st.rolls++;
        if (st.guess) { const hit = st.guess === st.side; if (hit) st.score++; st.last = hit ? 'hit' : 'miss'; }
        st.guess = 0;
      }
      return true;
    },
    draw(st, ctx, w, h) {
      const acc = _gCss('--accent', '#6aa9ff'), txt = _gCss('--text', '#fff'), mut = _gCss('--muted', '#888');
      ctx.textAlign = 'center';
      ctx.fillStyle = mut; ctx.font = `600 ${Math.round(w * 0.038)}px sans-serif`;
      ctx.fillText(_gT('game_coin_guess'), w / 2, h * 0.045);
      [1, 2].forEach(n => {                                            // выбар боку: 👑 ці 🌾
        const [cx, cy, hw, hh] = _coinGuessBox(n, w, h);
        ctx.fillStyle = st.guess === n ? acc : _gCss('--surface2', '#222');
        _gRoundRect(ctx, cx - hw, cy - hh, hw * 2, hh * 2, hh * 0.4); ctx.fill();
        ctx.fillStyle = st.guess === n ? '#fff' : mut;
        ctx.font = `600 ${Math.round(w * 0.05)}px sans-serif`;
        ctx.fillText((n === 1 ? '🏛 ' : '🌾 ') + _gT(n === 1 ? 'game_coin_heads' : 'game_coin_tails'), cx, cy + hh * 0.32);
      });
      const cx = w / 2, cy = h * 0.52 - st.fly * h * 0.14, R = w * 0.17;
      const c = Math.cos(st.ang), face = c >= 0 ? 1 : 2;
      const ry = Math.max(R * 0.06, R * Math.abs(c));                  // рабро ніколі не знікае цалкам — інакш манета «прападае»
      // ⚠️ Раней «золата» было `_gColor(3,6,true)` — тое, што выпадкова ЛЯЖАЛА пад гэтым індэксам
      // (жоўта-зялёны хад агульнай палітры). Пасля выпраўлення размеркавання ў `_gColor` (n цяпер
      // сапраўды раскідвае колеры) той жа выклік вярнуў бы ЗУСІМ іншы колер — golden не мусіць
      // «плаваць» ад таго, як мяняецца агульная палітра. Свой літаральны залаты, не пазычаны індэкс.
      const gold = 'hsl(45 62% 54%)', silver = mut;
      ctx.fillStyle = face === 1 ? gold : silver;                      // таўшчыня манеты (бок)
      _gEllipse(ctx, cx, cy + R * 0.06, R, ry); ctx.fill();
      ctx.fillStyle = face === 1 ? gold : silver;
      _gEllipse(ctx, cx, cy, R, ry); ctx.fill();
      ctx.strokeStyle = _gCss('--surface', '#111'); ctx.lineWidth = R * 0.08;
      _gEllipse(ctx, cx, cy, R * 0.82, ry * 0.82); ctx.stroke();
      if (ry > R * 0.35) {                                             // грань відаць толькі калі манета павернута да нас
        // 🏛 АРОЛ — БАРЭЛЬЕФ ПРОФІЛЮ, як на сапраўдных манетах (заўвага карыстальніка 30.07: «замест
        // кароны класічны профіль Цэзара»). Малюем ЛІНІЯМІ, не эмодзі: каляровае эмодзі малюецца
        // ўласнымі колерамі незалежна ад `fillStyle`, таму ніколі не выглядала чаканкай і патрабавала
        // цёмнай падкладкі. Барэльеф жа бярэ колер самой манеты — святло зверху, цень знізу, як у
        // рэльефе. Рэшка застаецца сімвалам-калоссем (яна на срэбным баку і чытаецца добра).
        if (face === 1) _coinCaesar(ctx, cx, cy, R, ry);
        else {
          ctx.fillStyle = 'rgba(0,0,0,.30)';
          ctx.beginPath(); ctx.arc(cx, cy - R * 0.05, R * 0.46, 0, 7); ctx.fill();
          ctx.font = `${Math.round(R * 0.9)}px sans-serif`;
          ctx.fillText('🌾', cx, cy + R * 0.32);
        }
      }
      if (!st.spin && st.side) {
        ctx.fillStyle = txt; ctx.font = `700 ${Math.round(w * 0.05)}px sans-serif`;
        ctx.fillText(_gT(st.side === 1 ? 'game_coin_heads' : 'game_coin_tails'), cx, h * 0.76);
        if (st.last) {
          ctx.fillStyle = st.last === 'hit' ? _gCss('--success', '#4ac26b') : mut;
          ctx.font = `600 ${Math.round(w * 0.036)}px sans-serif`;
          ctx.fillText(_gT(st.last === 'hit' ? 'game_dice_hit' : 'game_dice_miss'), cx, h * 0.805);
        }
      }
      ctx.fillStyle = st.spin ? mut : acc;
      _gRoundRect(ctx, w * 0.28, h * 0.87, w * 0.44, h * 0.085, w * 0.02); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = `600 ${Math.round(w * 0.04)}px sans-serif`;
      ctx.fillText(_gT('game_coin_flip'), cx, h * 0.925);
      ctx.textAlign = 'start';
    },
  },
  // 🐍 ЗМЕЙКА — замест Пінбола (рашэнне карыстальніка 30.07: «ні дызайну, ні кіравання»).
  // Пінбол дрэнна кладзецца на нашу рамку: яму патрэбны доўгі вертыкальны стол, нахіл, мультыбол —
  // а тут квадратная дошка ў форме панэлі і два клавішы. Змейка ж кладзецца ідэальна: сетка+стрэлкі
  // (і свайп на тачы — той самы `move`), уласны тэмп праз `tick`, складанасць расце сама з даўжынёй.
  snake: {
    size: 12,
    noBurst: true,                                                     // цела ЕДЗЕ па полі — «лопанне» было б ілжывым на кожным кроку
    init(st) {
      st.body = [78, 77, 76];                                          // галава першая
      st.dir = [0, 1]; st.pend = [0, 1];                               // [dr, dc] — управа
      st.score = 0; st.over = false; st.won = false; st._acc = 0;
      st.started = false;                                              // стаіць, пакуль не зробяць першы ход
      _snakeFood(st); _snakeGrid(st);
    },
    stat: st => st.body.length,                                        // трэці лічыльнік пліткай: даўжыня
    move(st, d) {                                                      // стрэлкі І свайп — адзін шлях
      const v = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] }[d];
      return v ? _snakeTurn(st, v) : false;
    },
    // 👆 ТАП ПА ПОЛІ — паварот У БОК тапнутай клеткі. На тэлефоне свайп патрабуе працягнуць палец
    // 24px І адпусціць, а ў змейцы павароты частыя і хуткія — падымаць палец на кожны раз нязручна.
    // Тап жа рухавік аддае сам (`onCell`), і змейка яго проста не брала — значыць кіраванне
    // з'яўляецца БЕЗ адзінага радка ў рухавіку: гульня толькі пачынае карыстацца тым, што ўжо ёсць.
    onCell(st, i) {
      const N = 12, h = st.body[0];
      const dr = Math.floor(i / N) - Math.floor(h / N), dc = i % N - h % N;
      if (!dr && !dc) return false;
      return _snakeTurn(st, Math.abs(dr) > Math.abs(dc) ? [Math.sign(dr), 0] : [0, Math.sign(dc)]);
    },
    tick(st, dt) {
      // ⚠️ Не стартуем самі: інакш чалавек, які толькі адкрыў дошку (асабліва наведвальнік сайта),
      // губляе партыю за секунду, не паспеўшы зразумець, што яна ўжо ідзе. Чакаем першага ходу.
      if (st.over || !st.started) return false;
      st._acc += dt;
      // тэмп расце з даўжынёй — гэта і ёсць «узроўні» змейкі, без асобнага хука
      const step = Math.max(90, 210 - (st.body.length - 3) * 5);
      if (st._acc < step) return false;                                // false = кадр без перамалёўкі (не паліць CPU дарма)
      st._acc = 0;
      st.dir = st.pend;
      const N = 12, h = st.body[0], r = Math.floor(h / N) + st.dir[0], c = h % N + st.dir[1];
      if (r < 0 || r >= N || c < 0 || c >= N) { st.over = true; return true; }   // сцяна
      const nh = r * N + c;
      const grow = nh === st.food;
      // хвост сыходзіць у гэтым жа кроку, таму ўрэзацца ў яго апошнюю клетку МОЖНА (класічнае правіла)
      const body = grow ? st.body : st.body.slice(0, -1);
      if (body.includes(nh)) { st.over = true; return true; }                     // сам у сябе
      st.body = [nh, ...body];
      if (grow) { st.score += 10; _snakeFood(st); }
      _snakeGrid(st);
      return true;
    },
    cellHtml(v, pop, i, st) {
      if (v === 3) return `<div class="tg-cell"><span style="display:block;width:56%;height:56%;border-radius:50%;background:var(--accent)"></span></div>`;
      if (!v) return `<div class="tg-cell tg-empty"></div>`;
      const head = v === 2;
      return `<div class="tg-cell"><span style="display:block;width:${head ? 92 : 78}%;height:${head ? 92 : 78}%;`
        + `border-radius:${head ? '32%' : '26%'};background:${_gColor(head ? 1 : 3, 7)}"></span></div>`;
    },
  },
  arkanoid: {
    mode: 'canvas',
    size: 1,
    init(st) {
      st.score = 0; st.over = false; st.won = false; st.lives = 3; st.level = 1;
      st.pad = 0.5; st.padTarget = 0.5;
      _arkBuildBricks(st);
      _arkReset(st);
    },
    stat: st => st.level,
    // 🏔 Складанасць узроўняў (заўвага карыстальніка 30.07: «трэба абавязкова»). Разбіў усю сцяну —
    // партыя не канчаецца: `st.won=true` (не `over`) паказвае той жа банер «Гуляць далей», што ў
    // 2048, а рухавік (`_gamesDismissWin`) пры кліку кліча `nextLevel` — і партыя ідзе далей з новым,
    // цяжэйшым мурам. Жыцці і рахунак пераносяцца, мяч проста вяртаецца на ракетку.
    nextLevel(st) { _arkBuildBricks(st); _arkReset(st); },
    // Кіраванне ТРОЙЧЫ, бо адзін спосаб заўжды камусьці не відавочны (заўвага карыстальніка 29.07:
    // «не ведаю, як кіраваць»): мыш/палец вядуць ракетку · ← → рухаюць яе ж (штатны хук `move`
    // рухавіка — клавіятура падключаецца сама) · націск ці стрэлка ЗАПУСКАЮЦЬ мяч.
    // Мяч чакае на ракетцы, а не ляціць адразу — інакш тры жыцці зыходзяць, пакуль чытаеш правілы.
    // ⚠️ Заўвага карыстальніка 30.07 (кіраванне на Tesla «неяк не плаўна»): раней ракетка скакала
    // РОЎНА пад палец кожным `pointermove` — на буйных інфармацыйна-забаўляльных экранах з нізкай
    // частатой апытання/дакладнасцю тачу гэта чыталася як рыўкі. Цяпер палец задае ТОЛЬКІ мэту
    // (`padTarget`), а бачная пазіцыя `pad` даганяе яе плаўна ў `tick` — рыўкі крыніцы згладжваюцца.
    onPoint(st, x, y, phase) {
      st.padTarget = Math.min(0.88, Math.max(0.12, x));
      if (phase === 'down') st.launched = true;
      return false;
    },
    move(st, dir) {
      if (dir === 'left') st.padTarget = st.pad = Math.max(0.12, st.pad - 0.06);
      else if (dir === 'right') st.padTarget = st.pad = Math.min(0.88, st.pad + 0.06);
      else st.launched = true;                                         // ↑/↓ — пуск
      return true;
    },
    tick(st, dt) {
      if (st.over || st.won) return false;                             // won: банер «Гуляць далей» — мяч чакае, не гуляе за кадрам
      const k = dt / 16;                                               // крок нармалізаваны да 60 к/с — фізіка не залежыць ад частаты кадраў
      // дагон мэты: 0.3 за кадр 60fps — адчувальна, але без рыўкоў; keyboard-рух вышэй сам стаўляе
      // pad=padTarget, таму тут яго не «адкідвае» назад.
      st.pad += (st.padTarget - st.pad) * Math.min(1, 0.3 * k);
      if (!st.launched) { st.x = st.pad; st.y = 0.9; return true; }     // ляжыць на ракетцы і едзе разам з ёй
      st.x += st.vx * k; st.y += st.vy * k;
      if (st.x < 0.03 || st.x > 0.97) { st.vx *= -1; st.x = Math.min(0.97, Math.max(0.03, st.x)); }
      if (st.y < 0.03) { st.vy = Math.abs(st.vy); st.y = 0.03; }
      // Пліткі: адбіванне па той восі, з якой мяч УВАЙШОЎ — інакш ён «прыліпае» да рада і выядае
      // яго знізу, замест таго каб адскокваць
      for (const b of st.bricks) {
        if (!b.alive) continue;
        if (st.x < b.x - 0.02 || st.x > b.x + b.w + 0.02 || st.y < b.y - 0.02 || st.y > b.y + b.h + 0.02) continue;
        b.alive = 0; st.score += 10;
        const prevX = st.x - st.vx * k, prevY = st.y - st.vy * k;
        if (prevY <= b.y || prevY >= b.y + b.h) st.vy *= -1; else st.vx *= -1;
        if (!st.bricks.some(z => z.alive)) st.won = true;               // over застаецца false — партыя працягнецца пасля «Гуляць далей»
        break;                                                         // не больш за адну плітку за кадр
      }
      if (st.y > 0.92 && Math.abs(st.x - st.pad) < 0.12) {             // ракетка: вугал залежыць ад месца ўдару
        st.vy = -Math.abs(st.vy);
        st.vx += (st.x - st.pad) * 0.02;
        st.y = 0.92;
      }
      if (st.y > 1.02) { st.lives--; if (st.lives <= 0) st.over = true; else _arkReset(st); }
      // «Сцяна» скорасці: без яе мяч ад серыі ўдараў разганяецца так, што пралятае ракетку паміж
      // кадрамі (тунэляванне) і знікае «сам сабой» — выглядае як паломка, а не як прайгрыш.
      // `st.vmax` расце з узроўнем (гл. `_arkBuildBricks`) — тая ж «сцяна», але цяжэйшая партыя мае
      // права на хутчэйшы мяч.
      const v = Math.hypot(st.vx, st.vy);
      if (v > st.vmax) { st.vx *= st.vmax / v; st.vy *= st.vmax / v; }
      return true;
    },
    draw(st, ctx, w, h) {
      st.bricks.forEach(b => {
        if (!b.alive) return;
        ctx.fillStyle = _gColor(b.c, 4, true);
        ctx.fillRect(b.x * w, b.y * h, b.w * w, b.h * h);
      });
      ctx.fillStyle = _gCss('--text', '#fff');
      ctx.beginPath(); ctx.arc(st.x * w, st.y * h, 0.018 * w, 0, 7); ctx.fill();
      ctx.fillStyle = _gCss('--accent', '#6aa9ff');
      ctx.fillRect((st.pad - 0.12) * w, 0.94 * h, 0.24 * w, 0.022 * h);
      ctx.fillStyle = _gCss('--muted', '#888');
      ctx.font = `${Math.round(w * 0.05)}px sans-serif`;
      ctx.fillText('♥'.repeat(Math.max(0, st.lives)), w * 0.03, h * 0.075);
      // пакуль не запушчана — кажам ПРАМА на дошцы, што рабіць: падказка пад полем чытаецца
      // не заўсёды, а тут чалавек якраз глядзіць і чакае
      if (!st.launched && !st.over) {
        ctx.fillStyle = _gCss('--text', '#fff');
        ctx.font = `600 ${Math.round(w * 0.045)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(_gTGame('arkanoid', 'launch'), w / 2, h * 0.72);
        ctx.textAlign = 'start';
      }
    },
  },
};

// ── унутранае «злучы пункты» ──────────────────────────────────────────────────
// 🏔 Пабудова аднаго раскладу (init І nextLevel — адна крыніца праўды, DRY). Колькасць пар расце
// з узроўнем: 4 на першым, +1 за ўзровень, столя 7 — на сетцы 6×6=36 болей шляхоў НАДЗЕЙНА не
// пакладзеш (гл. `budget` у `_flowCarve` ніжэй).
function _flowBuild(st) {
  st.pairs = Math.min(7, 3 + st.level);
  for (let attempt = 0; attempt < 40; attempt++) {
    st.grid = Array.from({ length: 36 }, () => ({ d: 0, p: 0 }));    // d = колер кропкі, p = колер шляху
    const used = new Set();
    let ok = true;
    for (let c = 1; c <= st.pairs && ok; c++) {
      // budget — сярэдняя доля вольных ячэек на пару, што засталася пракласці; без гэтага пры
      // st.pairs=7 доўгія выпадковыя шляхі (да 9 ячэек) хутка з'ядаюць усё поле, і апошнія пары
      // ўвесь час не змяшчаюцца — 40 спроб ідуць у нікуды замест таго, каб проста весці карацейшыя шляхі.
      const budget = Math.max(3, Math.floor((36 - used.size) / (st.pairs - c + 1)));
      const path = _flowCarve(used, budget);
      if (!path) { ok = false; break; }
      path.forEach(i => used.add(i));
      st.grid[path[0]].d = c; st.grid[path[path.length - 1]].d = c;
    }
    if (ok) break;
  }
  st._draw = 0; st._path = [];
}
// Пракладка аднаго шляху па вольных ячэйках: выпадковае блуканне даўжынёй 3..budget, ніводнай
// агульнай ячэйкі з ужо пракладзенымі. Вяртае масіў ячэек або null, калі не выйшла (тады перазапуск).
function _flowCarve(used, budget = 9) {
  const free = [...Array(36).keys()].filter(i => !used.has(i));
  if (!free.length) return null;
  const start = free[Math.floor(Math.random() * free.length)];
  const path = [start], mine = new Set([start]);
  const want = 3 + Math.floor(Math.random() * Math.max(1, budget - 2));
  while (path.length < want) {
    const cur = path[path.length - 1], r = Math.floor(cur / 6), c = cur % 6;
    const next = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]
      .filter(([rr, cc]) => rr >= 0 && rr < 6 && cc >= 0 && cc < 6)
      .map(([rr, cc]) => rr * 6 + cc)
      .filter(i => !used.has(i) && !mine.has(i));
    if (!next.length) break;
    const pick = next[Math.floor(Math.random() * next.length)];
    path.push(pick); mine.add(pick);
  }
  return path.length >= 3 ? path : null;                               // шлях з дзвюх ячэек — гэта не задача
}
function _flowStart(st, i) {
  const c = st.grid[i];
  if (!c.d) return false;
  st.grid.forEach(x => { if (x.p === c.d) x.p = 0; });                 // перамалёўка колеру пачынаецца нанова
  st._draw = c.d; st._path = [i]; c.p = c.d;
  return true;
}
function _flowCheck(st) {
  const n = st.pairs || 4;
  const done = [...Array(n).keys()].map(i => i + 1).every(c => {
    const ends = st.grid.map((x, i) => x.d === c ? i : -1).filter(i => i >= 0);
    return ends.length === 2 && st.grid[ends[0]].p === c && st.grid[ends[1]].p === c;
  });
  if (done) { st.won = true; st.score = st.grid.filter(x => x.p).length; }   // over застаецца false — «Гуляць далей» вядзе да nextLevel
}

// ── унутраныя кубікі і манета ─────────────────────────────────────────────────
// Скруглены прамавугольнік і эліпс — старыя Safari не ведаюць ctx.roundRect/ellipse з усімі
// аргументамі, а гульні павінны малявацца ўсюды аднолькава.
function _gRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}
function _gEllipse(ctx, cx, cy, rx, ry) {
  ctx.beginPath();
  ctx.save(); ctx.translate(cx, cy); ctx.scale(1, Math.max(0.0001, ry / rx));
  ctx.arc(0, 0, rx, 0, 7); ctx.restore();
}
// ⚠️ Заўвага карыстальніка 30.07: спачатку зрабілі стосам (гарызантальна ўдвая шырэйшыя кнопкі
// налеглі б адна на адну) — пасля карыстальнік захацеў ГАРЫЗАНТАЛЬНА, як было, але з тым самым
// (буйнейшым) памерам. Вышыня/шрыфт застаюцца тыя ж, што ў стосе, шырыня звужана роўна настолькі,
// каб дзве кнопкі змясціліся ў радок. Вяртае [cx, cy, паўшырыня, паўвышыня].
// 🏛 Профіль-барэльеф (лаўровы вянок + галава ў профіль), намаляваны крывымі. Сціскаецца па
// вертыкалі разам з манетай (`ry/R`) — таму круціцца разам з ёй, а не «вісіць» плоскім стыкерам.
// Колеры — толькі святло і цень на колеры самой манеты: так чытаецца як чаканка, а не як налепка.
// 🏛 ГРАНЬ «АРОЛ» — фота сапраўднага дэнарыя Цэзара (44 да н.э., CAESAR IMP).
// ⚖️ Ліцэнзія: CC0 1.0 (Public Domain Dedication), аўтар здымка Alan Roche / American Numismatic
// Society, Wikimedia Commons «Denarius portrait of Julius Caesar.jpg». CC0 — адзіная ліцэнзія, што
// не патрабуе ні атрыбуцыі, ні share-alike, значыць фота бяспечна едзе на КЛІЕНЦКІЯ сайты разам з
// шаблонам (сама антычная манета ў грамадскім набытку, але ЗДЫМАК — асобны аб'ект права; скрын з
// пошуку тут быў бы камерцыйным выкарыстаннем чужога фота).
// 📦 Убудавана data-URI (≈24 КБ, 220px q60): кампанент самадастатковы — ніводнага знешняга запыту,
// як і ўсё астатняе ў гульнях. Памер падабраны пад рэальны рэндэр (~120px), большае не відаць.
const _COIN_IMG_SRC = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAK4QrhAAD/4QEuRXhpZgAATU0AKgAAAAgABgEaAAUAAAABAAAAVgEbAAUAAAABAAAAXgEoAAMAAAABAAIAAAE7AAIAAAAYAAAAZoKYAAIAAAAmAAAAfodpAAQAAAABAAAApAAAAAAAAArhAAAAAQAACuEAAAABUGhvdG9ncmFwaGVyOkFsYW4gUm9jaGUAQ29weXJpZ2h0OkFtZXJpY2FuIE51bWlzbWF0aWMgU29jaWV0eQAAB5ADAAIAAAAUAAAA/pAEAAIAAAAUAAABEpKRAAIAAAAEMDg3AJKSAAIAAAADODcAAKABAAMAAAABAAEAAKACAAQAAAABAAAA3KADAAQAAAABAAAA3AAAAAAyMDE1OjA2OjA1IDE2OjI5OjU0ADIwMTU6MDY6MDUgMTY6Mjk6NTQA/+EMBWh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8APD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNi4wLjAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczphdXg9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvYXV4LyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgYXV4Ok93bmVyTmFtZT0iQW1lcmljYW4gTnVtaXNtYXRpYyBTb2NpZXR5IiBhdXg6TGVuc0luZm89IjE4MC8xIDE4MC8xIDAvMCAwLzAiIGF1eDpGaXJtd2FyZT0iMS4wLjkiIGF1eDpJbWFnZU51bWJlcj0iMCIgYXV4OkxlbnNJRD0iMTczIiBhdXg6TGVucz0iRUYxODBtbSBmLzMuNUwgTWFjcm8gVVNNIiBhdXg6Rmxhc2hDb21wZW5zYXRpb249IjAvMSIgYXV4OlNlcmlhbE51bWJlcj0iMTYyMDcxMjM1OSIgcGhvdG9zaG9wOkRhdGVDcmVhdGVkPSIyMDE1LTA2LTA1VDE2OjI5OjU0IiB4bXA6UmF0aW5nPSIwIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxNS0wNi0wNVQxNjoyOTo1NCI+IDxkYzpyaWdodHM+IDxyZGY6QWx0PiA8cmRmOmxpIHhtbDpsYW5nPSJ4LWRlZmF1bHQiPkNvcHlyaWdodDpBbWVyaWNhbiBOdW1pc21hdGljIFNvY2lldHk8L3JkZjpsaT4gPC9yZGY6QWx0PiA8L2RjOnJpZ2h0cz4gPGRjOmNyZWF0b3I+IDxyZGY6U2VxPiA8cmRmOmxpPlBob3RvZ3JhcGhlcjpBbGFuIFJvY2hlPC9yZGY6bGk+IDwvcmRmOlNlcT4gPC9kYzpjcmVhdG9yPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8P3hwYWNrZXQgZW5kPSJ3Ij8+AP/tAL5QaG90b3Nob3AgMy4wADhCSU0EBAAAAAAAhRwBWgADGyVHHAIAAAIAAhwCUAAXUGhvdG9ncmFwaGVyOkFsYW4gUm9jaGUcAj4ACDIwMTUwNjA1HAI/AAYxNjI5NTQcAjcACDIwMTUwNjA1HAI8AAYxNjI5NTQcAnQAJUNvcHlyaWdodDpBbWVyaWNhbiBOdW1pc21hdGljIFNvY2lldHkAOEJJTQQlAAAAAAAQCdRobyB32+Gi0JYw8CznBv/AABEI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';
let _coinImg = null;
function _coinImage() {                                                // ленава: грузім пры першым малюнку
  if (!_coinImg) {
    _coinImg = new Image();
    // ⚠️ Дэкадаванне ідзе АСІНХРОННА, а нерухомая манета не перамалёўваецца сама (tick вяртае false,
    // калі не круціцца) — без гэтага першы кадр заставаўся б пустым дыскам НАЗАЎЖДЫ, пакуль не
    // крутанеш. Таму па загрузцы просім рухавік перамаляваць усе змантаваныя дошкі — адзін раз.
    _coinImg.onload = () => _gamesRepaintAll();
    _coinImg.src = _COIN_IMG_SRC;
  }
  return _coinImg.complete && _coinImg.naturalWidth ? _coinImg : null;
}
function _coinCaesar(ctx, cx, cy, R, ry) {
  const img = _coinImage();
  if (!img) return;                                                    // яшчэ не дэкадавалася — кадр без грані, наступны ўжо з ёй
  ctx.save();
  ctx.beginPath(); _gEllipse(ctx, cx, cy, R * 0.98, ry * 0.98); ctx.clip(); // строга ў межы манеты
  ctx.drawImage(img, cx - R, cy - ry, R * 2, ry * 2);                  // сціскаецца разам з манетай пры кручэнні
  // фота срэбнае, а бок «арол» у нас залаты — таму мяккі залаты тон па версе (multiply),
  // інакш грань выглядала б наклееным чужым кружком на залатым дыску
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = 'rgba(212,164,58,.55)';
  ctx.beginPath(); _gEllipse(ctx, cx, cy, R * 0.98, ry * 0.98); ctx.fill();
  ctx.restore();
}
function _coinGuessBox(n, w, h) {
  const hw = w * 0.22, hh = h * 0.075;
  return [w * (n === 1 ? 0.26 : 0.74), h * 0.135, hw, hh];
}
function _coinGuessAt(x, y) {
  for (const n of [1, 2]) {
    const [cx, cy, hw, hh] = _coinGuessBox(n, 1, 1);
    if (Math.abs(x - cx) < hw && Math.abs(y - cy) < hh) return n;
  }
  return 0;
}
// ⚠️ Заўвага карыстальніка 30.07 («у дзіцці так не бывае» — косткі кружыліся заўжды аднолькава,
// люстрана адна насустрач другой): цяпер КОЖНАЯ костка мае свой выпадковы напрамак і хуткасць
// кручэння (`rotDir`/`rotSpeed`), а не адзіны агульны кут з механічным люстэркам па парнасці.
function _diceStart(st) {
  st.spin = 900; st.t = 0; st.last = '';
  st.rotDir = st.dice.map(() => (Math.random() < 0.5 ? -1 : 1));
  st.rotSpeed = st.dice.map(() => 0.65 + Math.random() * 0.7);
}
// 🎲 Рэжым 1/2/3 кубікі (заўвага карыстальніка 30.07) — захаваны выбар, як і стол пінбола.
const _DICE_MODE_KEY = 'ttzop_game_dice_mode';
function _diceLoadMode() { const v = parseInt(localStorage.getItem(_DICE_MODE_KEY)); return [1, 2, 3].includes(v) ? v : 2; }
function _diceSaveMode(n) { try { localStorage.setItem(_DICE_MODE_KEY, String(n)); } catch {} }
function _diceModeBox(m, w, h) { return [w * (0.5 + (m - 2) * 0.16), h * 0.032, w * 0.028]; }
function _diceModeAt(x, y) {
  for (const m of [1, 2, 3]) {
    const [cx, cy, r] = _diceModeBox(m, 1, 1);
    if (Math.hypot(x - cx, y - cy) < r * 1.6) return m;
  }
  return 0;
}
// 🔢 Заўвага карыстальніка 30.07 («шрыфт прагнозу ў 2 разы большы»): пры n=3 варыянтаў 16
// (3..18) — адным радком буйным шрыфтам яны не змесцяцца, таму больш за 6 варыянтаў разбіваем
// на два раду. Памер кружка лічыцца ад таго, колькі іх у РАДЗЕ (`perRow`), не ад агульнай колькасці:
// пры n=1 (6 варыянтаў, адзін рад) і n=2 (11 варыянтаў, 6+5) кружкі буйныя амаль на поўны памер.
function _diceGuessLayout(st) {
  const n = st.n || 2, min = n, max = n * 6, count = max - min + 1;
  const perRow = count > 6 ? Math.ceil(count / 2) : count;
  const rows = Math.ceil(count / perRow);
  const r = Math.min(0.072, 0.94 / (perRow * 2.05));
  return { min, max, count, perRow, rows, r };
}
function _diceGuessBox(v, st, w, h) {
  const L = _diceGuessLayout(st);
  const idx = v - L.min, row = Math.floor(idx / L.perRow), rowStart = row * L.perRow;
  const rowCount = Math.min(L.perRow, L.count - rowStart), col = idx - rowStart;
  const gap = (0.94 - rowCount * L.r * 2) / (rowCount + 1);
  const x = 0.03 + gap + L.r + col * (L.r * 2 + gap);
  const y = 0.185 + row * (L.r * 2.3);                                // ніжэй за надпіс «Ваш прагноз» (0.135), не налягае
  return [x * w, y * h, L.r * w];
}
function _diceGuessAt(x, y, st) {                                     // трапленне ў кружок прагнозу (у долях)
  const L = _diceGuessLayout(st);
  for (let v = L.min; v <= L.max; v++) {
    const [cx, cy, r] = _diceGuessBox(v, st, 1, 1);
    if (Math.hypot(x - cx, y - cy) < r * 1.4) return v;
  }
  return 0;
}
// Ізаметрычны кубік: верхняя грань — ромб з кропкамі, дзве бакавыя — цень. Кропкі кладуцца
// на ромб білінейна, таму сетка 3×3 «ляжыць» на гране, а не малюецца плоскім квадратам.
// ⚠️ Заўвага карыстальніка 30.07 («прыплюснутыя, а не кубікі»): бакавая грань `d` была занадта
// нізкая (0.62s) адносна шырыні ромба — кубік чытаўся як манетка, не як куб. Цяпер глыбейшая.
// Кручэнне пры кідку робіцца ЗВОНКУ (`ctx.rotate` усёй выявы ў `draw`), не сцісканнем тут —
// сцісканне якраз і рабіла куб «прыплюснутым» замест аб'ёмнага (той жа скрыншот карыстальніка).
// ⚠️ Заўвага карыстальніка 30.07 («дадай перспектыву, не забудзь што гэта кубікі, а не
// прыплюснутыя кубікі»): плоская закраска трох граняў адным колерам кожная чыталася як
// каляровыя шматкутнікі-налепкі, не як асветлены аб'ём. Дадаў: (1) цёмны контур на КОЖНАЙ грані —
// менавіта рэзкая мяжа паміж гранямі і чытаецца вокам як «рэбра куба»; (2) градыент-бліск на
// верхняй (самай светлай) гране — імітацыя, што святло падае з аднаго кута, а не заліта роўна.
function _diceCube(ctx, cx, cy, s, val, acc, txt) {
  // ⚠️ Заўвага карыстальніка 30.07 (скрыншот побач трох костак): нават 0.92s бакавой глыбіні
  // чыталася «прыплюснута» — верхні ромб (шырыня 2s) відавочна дамінаваў над бакавымі гранямі.
  // 1.3s робіць агульную вышыню (T да ніза бакавых граняў) БОЛЬШАЙ за шырыню — цяпер відавочна куб,
  // не шайба.
  const T = [cx, cy - s], R = [cx + s, cy - s / 2], B = [cx, cy], L = [cx - s, cy - s / 2], d = s * 1.3;
  const poly = pts => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach(p => ctx.lineTo(p[0], p[1])); ctx.closePath(); };
  ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = Math.max(1, s * 0.035);
  ctx.fillStyle = `color-mix(in srgb, ${acc} 55%, black)`;
  poly([L, B, [B[0], B[1] + d], [L[0], L[1] + d]]); ctx.fill(); ctx.stroke();
  ctx.fillStyle = `color-mix(in srgb, ${acc} 75%, black)`;
  poly([B, R, [R[0], R[1] + d], [B[0], B[1] + d]]); ctx.fill(); ctx.stroke();
  const shine = ctx.createLinearGradient(L[0], L[1], R[0], R[1]);      // святло «з левага верху»
  shine.addColorStop(0, `color-mix(in srgb, ${acc} 85%, white)`);
  shine.addColorStop(0.55, acc);
  shine.addColorStop(1, `color-mix(in srgb, ${acc} 90%, black)`);
  ctx.fillStyle = shine;
  poly([L, T, R, B]); ctx.fill(); ctx.stroke();
  const PIPS = { 1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]],
    5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]] };
  // ⚠️ Заўвага карыстальніка 30.07 («на баках адразу намалюй кропкі, каб бачна было, як кубік
  // круціцца»): раней бакавыя грані былі голым колерам — куб верціцца, а «нумары» бачныя толькі
  // зверху, дзе яны не мяняюцца падчас кручэння. Кожная грань — сваё паралелаграмнае паходжанне
  // (origin+ex+ey), той жа білінейны разлік пазіцый кропак, што і раней для верху. Бакавыя значэнні
  // не фізічна дакладныя (мы не вядзём сапраўдную 3D-арыентацыю), але МЯНЯЮЦЦА разам з `val` —
  // відавочна розныя грані, не адна лічба паўсюль.
  const pipsOn = (origin, ex, ey, v, color) => {
    ctx.fillStyle = color;
    (PIPS[v] || []).forEach(([u, vv]) => {
      const a = (u + 0.5) / 3, b2 = (vv + 0.5) / 3;
      const x = origin[0] + a * ex[0] + b2 * ey[0], y = origin[1] + a * ex[1] + b2 * ey[1];
      ctx.beginPath(); ctx.arc(x, y, s * 0.085, 0, 7); ctx.fill();
    });
  };
  const leftVal = (val % 6) + 1, rightVal = ((val + 1) % 6) + 1;       // «суседнія» грані — не фізічны net, толькі для разнастайнасці
  pipsOn(L, [T[0] - L[0], T[1] - L[1]], [B[0] - L[0], B[1] - L[1]], val, txt);
  pipsOn(L, [B[0] - L[0], B[1] - L[1]], [0, d], leftVal, 'rgba(255,255,255,.65)');
  pipsOn(B, [R[0] - B[0], R[1] - B[1]], [0, d], rightVal, 'rgba(255,255,255,.8)');
}

// ── унутраныя кубікі ──────────────────────────────────────────────────────────
// ── унутранае «ружыкі-нулікі» ─────────────────────────────────────────────────
const _TTT_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function _tttWin(g, p) { return _TTT_LINES.some(l => l.every(i => g[i] === p)); }
// Адказ машыны: выйграць → не даць выйграць → цэнтр → вугал → што ёсць.
// ⚠️ Свядома НЕ мінімакс: беззаганная машына ніколі не прайграе, і гульня становіцца бессэнсоўнай —
// чалавек мусіць мець шанц. Гэтая стратэгія моцная, але яе можна абыграць «вілкай».
function _tttReply(g) {
  const free = g.map((v, i) => v ? -1 : i).filter(i => i >= 0);
  for (const p of [2, 1]) {                                            // спярша свой выйгрыш, потым блок чужога
    for (const i of free) { const t = g.slice(); t[i] = p; if (_tttWin(t, p)) return i; }
  }
  if (!g[4]) return 4;
  const corners = [0, 2, 6, 8].filter(i => !g[i]);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  return free[Math.floor(Math.random() * free.length)];
}

// ── унутранае «кропкі» ────────────────────────────────────────────────────────
function _dotsDrop(st) {                                               // падзенне слупком знізу ўверх + дабор зверху
  for (let c = 0; c < 6; c++) {
    let w = 5;
    for (let r = 5; r >= 0; r--) { const v = st.grid[r * 6 + c]; if (v) { st.grid[w * 6 + c] = v; w--; } }
    for (let r = w; r >= 0; r--) st.grid[r * 6 + c] = 1 + Math.floor(Math.random() * 5);
  }
}

// ── унутранае «правядзі лініі» ────────────────────────────────────────────────
// 🏔 Пабудова раскладу (init І nextLevel — адна крыніца праўды). Пар — ад узроўню (3→6, столя,
// бо 12 кропак у крузе і так шчыльна). Мінімальная адлегласць памяншаецца з ростам колькасці —
// інакш пры 6 парах (12 кропак) 200 спроб рэгулярна не хапала б месца і кропкі клаліся б з
// парушэннем мінімуму (сухі прагон паказаў бы «зліплыя» кропкі замест раўнамерных).
function _strBuild(st) {
  st.pairs = Math.min(6, 2 + st.level);
  const R = 0.44, lim = R * 0.62;
  const minDist = Math.max(0.1, 0.17 - (st.pairs - 3) * 0.018);
  st.dots = [];
  for (let c = 1; c <= st.pairs; c++) for (let k = 0; k < 2; k++) {
    let p, tries = 0;
    do {
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * lim;
      p = { x: 0.5 + Math.cos(a) * r, y: 0.5 + Math.sin(a) * r, c };
    } while (++tries < 200 && st.dots.some(d => Math.hypot(d.x - p.x, d.y - p.y) < minDist));
    st.dots.push(p);
  }
  st.paths = []; st.cur = null; st.from = -1;
}
function _strHit(st, x, y) {
  let best = -1, bd = 0.06;
  st.dots.forEach((d, i) => { const dist = Math.hypot(x - d.x, y - d.y); if (dist < bd) { bd = dist; best = i; } });
  return best;
}
function _strDone(st, i) { return st.paths.some(p => p.a === i || p.b === i); }
function _strOutside(pts) { return pts.some(p => Math.hypot(p.x - 0.5, p.y - 0.5) > 0.44); }
// Перасячэнне з ужо праведзенымі лініямі І САМА З САБОЙ. Суседнія звёны сваёй жа крывой
// прапускаем — яны дзеляць кропку і «перасякаюцца» заўжды.
function _strCrosses(st, pts) {
  const segs = [];
  st.paths.forEach(p => { for (let i = 0; i + 1 < p.pts.length; i++) segs.push([p.pts[i], p.pts[i + 1]]); });
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1];
    if (segs.some(([c, d]) => _xseg(a, b, c, d))) return true;
    for (let j = 0; j + 1 < i - 1; j++) if (_xseg(a, b, pts[j], pts[j + 1])) return true;
  }
  return false;
}
function _xseg(a, b, c, d) {
  const side = (p, q, r) => Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
  return side(a, b, c) !== side(a, b, d) && side(c, d, a) !== side(c, d, b);
}

// ── унутранае «распутай лініі» ────────────────────────────────────────────────
function _untHit(st, x, y) {                                           // бліжэйшая кропка ў радыусе захопу
  let best = -1, bd = 0.06;
  st.dots.forEach((d, i) => { const dist = Math.hypot(x - d.x, y - d.y); if (dist < bd) { bd = dist; best = i; } });
  return best;
}
// Скрыжаванні лічым ПАЎНАСЦЮ на кожны рух: 9 кропак → ~13 рэбраў → ~80 пар, гэта нішто,
// затое лічба заўсёды праўдзівая і не назапашвае памылку ад інкрэментальных абнаўленняў.
// будаўнік поля «Распутай лініі» (як _flowBuild/_strBuild у суседзяў): init і nextLevel — адзін шлях.
// 🏔 Узроўні (заўвага карыстальніка 30.07): 7 кропак → +2 на ўзровень, столь 15 — вышэй граф робіцца
// не складаней, а проста цясней, і кропкі перастаюць трапляцца пальцам.
function _untBuild(st) {
  const n = Math.min(15, 7 + (st.level || 0) * 2);

  // Рэбры будуюцца ў «сабраным» выглядзе (кропкі па коле): цыкл па перыметры + УКЛАДЗЕНЫЯ
  // хорды. Такі граф ГАРАНТАВАНА распутваецца — а выпадковы набор рэбраў мог бы не мець
  // плоскай укладкі, і чалавек круціў бы невырашальнае (тая ж пастка, што ў іншых гульнях).
  st.edges = [];
  for (let i = 0; i < n; i++) st.edges.push([i, (i + 1) % n]);
  const open = [];
  for (let i = 0; i < n; i++) {
    if (open.length && Math.random() < 0.45) {
      const a = open.pop();
      if (i - a > 1) st.edges.push([a, i]);                        // хорда толькі праз кропку — суседзі ўжо злучаны цыклам
    } else open.push(i);
  }
  // ...а паказваем РАСКІДАНА: гэта і ёсць галаваломка
  st.dots = [...Array(n).keys()].map(() => ({ x: 0.12 + Math.random() * 0.76, y: 0.12 + Math.random() * 0.76 }));
  st.score = 0; st.over = false; st.won = false; st._grab = -1;
  _untCount(st);
}
function _untCount(st) {
  st.bad = new Set(); let n = 0;
  for (let i = 0; i < st.edges.length; i++) for (let j = i + 1; j < st.edges.length; j++) {
    if (_segCross(st, st.edges[i], st.edges[j])) { st.bad.add(i); st.bad.add(j); n++; }
  }
  st.cross = n;
}
function _segCross(st, e1, e2) {
  if (e1[0] === e2[0] || e1[0] === e2[1] || e1[1] === e2[0] || e1[1] === e2[1]) return false; // агульная кропка — не скрыжаванне
  const p = i => st.dots[i];
  const side = (a, b, c) => Math.sign((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));
  const [a1, b1, a2, b2] = [p(e1[0]), p(e1[1]), p(e2[0]), p(e2[1])];
  return side(a1, b1, a2) !== side(a1, b1, b2) && side(a2, b2, a1) !== side(a2, b2, b1);
}

// ── унутраны арканоід ─────────────────────────────────────────────────────────
// Пуск: вышыня ўзлёту = vy²/(2·g). Пры vy=0.012 і g=0.00055 гэта ўсяго 0.13 поля — мяч НЕ дацягваў
// да бампераў (0.3–0.5) і партыя канчалася з нулём. 0.024 дае ≈0.52 — праходзіць усю дошку.
function _arkReset(st) { st.x = st.pad ?? 0.5; st.y = 0.9; st.vx = (Math.random() - 0.5) * 0.012; st.vy = -0.018; st.launched = false; }
// 🏔 Мур і хуткасная столя для дадзенага ўзроўню. Радкоў — ад 4 да 8 (болей не змесціцца чытэльна
// пры тых жа 7 слупках); хуткасная столя расце паволі, каб мяч заставаўся кіравальным нават на
// далёкіх узроўнях. Адна крыніца праўды для init і nextLevel — DRY, не капіюем разлік двойчы.
function _arkBuildBricks(st) {
  // тая ж геаметрыя радка, што і ў першапачатковых чатырох (0.062 крок, 0.05 вышыня) — новыя
  // радкі проста дадаюцца НІЖЭЙ, столя 8 радкоў застаецца далёка ад ракеткі (0.12+7×0.062+0.05≈0.60)
  const rows = Math.min(4 + (st.level - 1), 8);
  st.bricks = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < 7; c++) {
    st.bricks.push({ x: 0.06 + c * 0.127, y: 0.12 + r * 0.062, w: 0.115, h: 0.05, c: (r % 4) + 1, alive: 1 });
  }
  st.vmax = Math.min(0.03 + (st.level - 1) * 0.003, 0.05);
}

// ── унутранае «змейка» ────────────────────────────────────────────────────────
// Сетка перабудоўваецца З ЦЕЛА на кожным кроку, а не правіцца па месцах. Так немагчыма
// рассінхранізаваць малюнак і стан — той самы ўрок, што з мапай літар у «Лініях».
// адзін шлях павароту для стрэлак, свайпу і тапу — інакш правіла «без разварота на 180°» жыло б
// у трох месцах і разышлося б пры першай жа праўцы
function _snakeTurn(st, v) {
  if (st.over) return false;
  // ⚠️ разварот на 180° забаронены: галава ўехала б ва ўласную шыю, і партыя канчалася б ад
  // выпадковага руху, а не ад памылкі гульца
  if (st.body.length > 1 && v[0] === -st.dir[0] && v[1] === -st.dir[1]) return false;
  st.pend = v; st.started = true;                                      // першы ж рух запускае партыю
  return true;
}
function _snakeGrid(st) {
  st.grid = Array.from({ length: 144 }, () => 0);
  st.body.forEach((i, k) => { st.grid[i] = k === 0 ? 2 : 1; });
  if (st.food >= 0) st.grid[st.food] = 3;
}
function _snakeFood(st) {
  const free = [];
  for (let i = 0; i < 144; i++) if (!st.body.includes(i)) free.push(i);
  if (!free.length) { st.food = -1; st.won = true; st.over = true; return; }      // поле занята цалкам — перамога
  st.food = free[Math.floor(Math.random() * free.length)];
}

// ── унутранае «лініі» ─────────────────────────────────────────────────────────
// 🔤 брэндаваныя шары (заўвага карыстальніка 30.07): 30% новых шароў нясуць літару — 12% T,
// па 6% Z/O/P (пачатковыя 4/2/2/2% паказаліся рэдкімі — карыстальнік папрасіў утрая часцей).
// Ідэя: дасяжная другая мэта побач з класічным «пяць у рад» — сабраць поўны камплект T·T·Z·O·P
// (гл. `_linesLetterBonus`), незалежна ад колеру гэтых шароў.
function _linesLetter() {
  const r = Math.random();
  return r < 0.12 ? 'T' : r < 0.18 ? 'Z' : r < 0.24 ? 'O' : r < 0.30 ? 'P' : null;
}
function _linesSpawn(st, k) {
  for (let n = 0; n < k; n++) {
    const free = st.grid.map((v, i) => v ? -1 : i).filter(i => i >= 0);
    if (!free.length) { st.over = true; return; }
    const i = free[Math.floor(Math.random() * free.length)];
    st.grid[i] = 1 + Math.floor(Math.random() * 7);
    const L = _linesLetter();
    if (L) st.letters[i] = L;
    _linesClear(st, i);                                                // новы шар можа сам дабудаваць лінію
    _linesLetterBonus(st);                                             // ...ці дабудаваць камплект літар
  }
}
// 🏆 Бонус-выйгрыш: літары мусяць скласці СЛОВА T-T-Z-O-P у РАД — па гарызанталі, вертыкалі ці
// дыяганалі, у любым з двух напрамкаў (значыць і «справа налева», і «знізу ўверх»).
// ⚠️ ПЕРАПІСАНА 30.07 па заўвазе карыстальніка «нейкія выпадковыя шары знікаюць». Гэта быў не збой
// кода, а само правіла: раней бонус лічыў ПРОСТА КАМПЛЕКТ (2×T+Z+O+P дзе заўгодна на дошцы) — і
// пяць нязвязаных шароў з розных куткоў знікалі разам, часцей за ўсё пасля падзення новых
// (`_linesSpawn` кліча бонус на кожны новы шар). З месца гульца гэта і выглядала як «выпадковыя».
// Слова ў радзе — правіла, якое ВІДАЦЬ вокам: чалавек сам будуе яго і разумее, за што ўзнагарода.
const _LINES_WORD = 'TTZOP';
function _linesLetterBonus(st) {
  const N = 9, L = _LINES_WORD.length;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
      const cells = [];
      for (let k = 0; k < L; k++) {
        const rr = r + dr * k, cc = c + dc * k;
        if (rr < 0 || rr >= N || cc < 0 || cc >= N) break;
        cells.push(rr * N + cc);
      }
      if (cells.length !== L) continue;
      const word = cells.map(i => st.letters[i] || '·').join('');
      if (word !== _LINES_WORD && word !== [..._LINES_WORD].reverse().join('')) continue;
      cells.forEach(i => { st.grid[i] = 0; delete st.letters[i]; });
      st.score += 500;
      return true;
    }
  }
  return false;
}
function _linesPath(st, a, b) {                                        // хваля па пустых (шар не пераскоквае цераз іншыя)
  const seen = new Set([a]), q = [a];
  while (q.length) {
    const j = q.shift();
    if (j === b) return true;
    const r = Math.floor(j / 9), c = j % 9;
    [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].forEach(([rr, cc]) => {
      if (rr < 0 || rr > 8 || cc < 0 || cc > 8) return;
      const k = rr * 9 + cc;
      if (seen.has(k) || (st.grid[k] && k !== b)) return;
      seen.add(k); q.push(k);
    });
  }
  return false;
}
function _linesClear(st, i) {                                          // пяць+ у радзе праз ячэйку i па чатырох восях
  const col = st.grid[i]; if (!col) return false;
  const kill = new Set();
  [[1, 0], [0, 1], [1, 1], [1, -1]].forEach(([dr, dc]) => {
    const line = [i];
    for (const s of [1, -1]) {
      let r = Math.floor(i / 9) + dr * s, c = i % 9 + dc * s;
      while (r >= 0 && r < 9 && c >= 0 && c < 9 && st.grid[r * 9 + c] === col) { line.push(r * 9 + c); r += dr * s; c += dc * s; }
    }
    if (line.length >= 5) line.forEach(x => kill.add(x));
  });
  if (!kill.size) return false;
  kill.forEach(x => { st.grid[x] = 0; delete st.letters[x]; });        // літарны шар у лініі губляе і літару
  st.score += kill.size * 10;
  return true;
}

// ── унутранае «сапёр» ──────────────────────────────────────────────────────────
function _mineNbrs(i, n = 9) {
  const r = Math.floor(i / n), c = i % n, out = [];
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    if (!dr && !dc) continue;
    const rr = r + dr, cc = c + dc;
    if (rr >= 0 && rr < n && cc >= 0 && cc < n) out.push(rr * n + cc);
  }
  return out;
}
function _mineSeed(st, safe) {
  const ban = new Set([safe, ..._mineNbrs(safe)]);                     // першы клік і яго суседзі — заўжды чыстыя
  const free = st.grid.map((_, i) => i).filter(i => !ban.has(i));
  for (let k = 0; k < GAMES.mines.bombs && free.length; k++) {
    st.grid[free.splice(Math.floor(Math.random() * free.length), 1)[0]].m = 1;
  }
  st.grid.forEach((c, i) => { c.n = _mineNbrs(i).filter(j => st.grid[j].m).length; });
  st._seeded = true;
}
function _mineOpen(st, i) {                                            // разліў пустых — чарга, не рэкурсія (стэк на 81 ячэйцы бяспечны, але чарга чытальней)
  const q = [i];
  while (q.length) {
    const j = q.pop(), c = st.grid[j];
    if (c.r || c.f) continue;
    c.r = 1;
    if (!c.n) _mineNbrs(j).forEach(k => { if (!st.grid[k].r) q.push(k); });
  }
}

// ── унутранае «тры ў рад» ──────────────────────────────────────────────────────
function _gemMatches(st) {
  const hit = new Set(), g = st.grid;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 6; c++) {
    const i = r * 8 + c;
    if (g[i] && g[i] === g[i + 1] && g[i] === g[i + 2]) { hit.add(i); hit.add(i + 1); hit.add(i + 2); }
  }
  for (let c = 0; c < 8; c++) for (let r = 0; r < 6; r++) {
    const i = r * 8 + c;
    if (g[i] && g[i] === g[i + 8] && g[i] === g[i + 16]) { hit.add(i); hit.add(i + 8); hit.add(i + 16); }
  }
  return hit;
}
// Каскад разбіты на ДВА кадры знарок: калі зняць супадзенні і адразу дасыпаць новыя, ячэйка
// ніколі не бывае пустой — і «лопанне» рухавіка не мае чаго паказаць (гулец бачыць толькі, як
// лічба рахунку скача). Таму: цяпер здымаем, а падзенне адкладаем праз `st._pending`.
function _gemResolve(st) {
  const hit = _gemMatches(st);
  if (!hit.size) return false;
  st.score += hit.size * 10;
  hit.forEach(i => { st.grid[i] = 0; });
  st._pending = s => { _gemDrop(s); _gemResolve(s); return true; };    // наступны кадр: упалі і праверылі зноў
  return true;
}
function _gemDrop(st) {                                                // падзенне слупком знізу ўверх + дабор зверху
  for (let c = 0; c < 8; c++) {
    let w = 7;
    for (let r = 7; r >= 0; r--) { const v = st.grid[r * 8 + c]; if (v) { st.grid[w * 8 + c] = v; w--; } }
    for (let r = w; r >= 0; r--) st.grid[r * 8 + c] = 1 + Math.floor(Math.random() * 6);
  }
}

// ── унутранае 15: рухаецца плітка, СУСЕДНЯЯ з пустой (кірунак = куды едзе плітка) ──
function _p15Slide(st, dir) {
  const z = st.grid.indexOf(0), zr = Math.floor(z / 4), zc = z % 4;
  const d = { left: [0, 1], right: [0, -1], up: [1, 0], down: [-1, 0] }[dir];  // адкуль прыйдзе плітка
  const r = zr + d[0], c = zc + d[1];
  if (r < 0 || r > 3 || c < 0 || c > 3) return false;
  const from = r * 4 + c;
  st.grid[z] = st.grid[from]; st.grid[from] = 0;
  return true;
}

// ── унутранае 2048: пустая ячэйка ← 2 (90%) ці 4 ──────────────────────────────
function _g2048Spawn(st) {
  const free = st.grid.map((v, i) => v ? -1 : i).filter(i => i >= 0);
  if (!free.length) return;
  st.grid[free[Math.floor(Math.random() * free.length)]] = Math.random() < 0.9 ? 2 : 4;
}
// індэксы радкоў/слупкоў у парадку руху (галава спісу — куды ссоўваем)
function _g2048Lines(dir) {
  const n = 4, out = [];
  for (let r = 0; r < n; r++) {
    const row = [], col = [];
    for (let c = 0; c < n; c++) { row.push(r * n + c); col.push(c * n + r); }
    out.push(dir === 'left' ? row : dir === 'right' ? row.slice().reverse()
      : dir === 'up' ? col : col.slice().reverse());
  }
  return out;
}
function _g2048CanMove(st) {
  if (st.grid.some(v => !v)) return true;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    const v = st.grid[r * 4 + c];
    if (c < 3 && v === st.grid[r * 4 + c + 1]) return true;
    if (r < 3 && v === st.grid[(r + 1) * 4 + c]) return true;
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════
// РУХАВІК — агульны для ЎСІХ гульняў каталога
// ═══════════════════════════════════════════════════════════════

// HTML цела (для bodyFn Table-секцыі). Сама гульня ажывае ў gamesInit пасля ўстаўкі ў DOM.
function gamesBodyHtml(gameId, hostId) {
  if (!GAMES[gameId]) return '';
  const best = _gameBestGet(gameId);
  return `<div class="tg-wrap" id="${hostId}" data-game="${gameId}">
    <div class="tg-bar">
      <div class="tg-stat"><span class="tg-stat-l">${_gT('game_score')}</span><span class="tg-stat-v" id="${hostId}-score">0</span></div>
      <div class="tg-stat"><span class="tg-stat-l">${_gT('game_best')}</span><span class="tg-stat-v" id="${hostId}-best">${best}</span></div>
      ${GAMES[gameId].stat ? `<div class="tg-stat"><span class="tg-stat-l">${_gTGame(gameId, 'stat')}</span><span class="tg-stat-v" id="${hostId}-stat">—</span></div>` : ''}
      <button class="tg-btn" onclick="gamesRestart('${hostId}')">${_gT('game_new')}</button>
    </div>
    ${GAMES[gameId].mode === 'canvas'
      ? `<div class="tg-board tg-board-canvas" id="${hostId}-board"><canvas id="${hostId}-canvas"></canvas></div>`
      : `<div class="tg-board" id="${hostId}-board"></div>`}
    <div class="tg-hint">${_gTGame(gameId, 'hint')}</div>
  </div>`;
}

// Ажыўленне пасля ўстаўкі ў DOM. Ідэмпатэнтна: паўторны выклік не вешае другі слухач
// (панэль перарэндэрвае дрэва часта — гэта той самы клас багу «рэфрэш працуе, дынаміка не»).
function gamesInit(hostId) {
  const host = document.getElementById(hostId);
  if (!host || host._tgReady) return;
  host._tgReady = true;                      // гард на САМІМ вузле: паўторны выклік на тым жа DOM — нішто
  const gameId = host.dataset.game;
  // адзіная дошка на старонцы — фокусуецца сама (клавіятура «проста працуе», клік не патрэбны);
  // калі раней сфакусаваная дошка знікла з DOM АБО стала нябачнай (перарэндэр/згарнулі раздзел) —
  // таксама пераймаем. ⚠️ Заўвага карыстальніка 30.07 («фокус на 2048, а кіруецца Пятнашкі»):
  // раней правяралі толькі НАЯЎНАСЦЬ у DOM — панэль перарэндэрвае ЎВЕСЬ тэкст РМ пры любым кліку
  // (нават не ў гульні), і калі старая дошка застаецца бачнай побач з новай, `_gamesFocused` НЕ
  // мусіць скакаць — гэта карэктна. Але калі яна была ЗГОРНУТАЯ (нябачная), а зараз глядзяць на
  // іншую — фокус мусіў перайсці, а праверка «ёсць у DOM» гэтага не бачыла.
  const focusedEl = _gamesFocused && document.getElementById(_gamesFocused);
  if (!focusedEl || !_gamesVisible(focusedEl)) _gamesFocused = hostId;
  _gamesRetuneSole();                          // засталася адна бачная дошка → яна і кіруецца

  // ⚠️ Партыя перажывае перарэндэр. Дрэва перамалёўваецца ад любога кліку ў РМ (разгарнуў суседні
  // вузел — новы DOM), і калі init скідаў бы поле, гульня абнулялася б чужым дзеяннем. Таму стан
  // жыве ў _gameStates па hostId, а не на элеменце; нанова заводзім толькі калі яго яшчэ няма.
  let st = _gameStates[hostId];
  if (!st || st.id !== gameId) { st = _gameStates[hostId] = { id: gameId, cfg: GAMES[gameId] }; st.cfg.init(st); }
  _gamesEnsureStyle();
  _gamesPaint(hostId);

  // 🎯 фокус дошкі — клік/тап у ЛЮБое яе месца (капціраванне, каб не залежаць ад таго, дзе менавіта
  // ўнутры хоста жыве ўвод: сеткавы board ці canvas). Без гэтага дзве адкрытыя дошкі (заўвага
  // карыстальніка 30.07: Арканоід + Пінбол побач) абедзве бачныя → абедзве слухалі б стрэлкі разам.
  // ⚠️ Бачны індыкатар (рамка вакол дошкі) паказаўся лішнім — карыстальнік адзначыў, што форма
  // ў панэлі ўжо мае сваю рамку актыўнасці, дадатковая была залішняй (30.07). Пакінуты толькі
  // сам механізм пераключэння, без асобнага перамалявання дзеля візуалу.
  host.addEventListener('pointerdown', () => { gamesFocus(hostId); }, true);
  // ⚠️ 30.07, ДРУГАЯ РЭДАКЦЫЯ. Тут стаяў `IntersectionObserver`, які браў фокус дошцы, як толькі яна
  // трапляла ў кадр. Два хібы: (1) назіральнік ствараўся НАНОВА пры кожным перарэндэры дрэва і ніколі
  // не адключаўся — на кожную дошку іх назапашваліся дзясяткі, у тым ліку на ўжо адлучаных вузлах;
  // (2) галоўнае — фокус пачынала вырашаць ПРАКРУТКА: правёў старонку міма чужой дошкі, і клавіятура
  // ўжо кіруе ёю, хоць чалавек нічога не выбіраў. Фокус дае толькі ЯЎНЫ выбар (клік/тап вышэй) плюс
  // адзінае аўта-правіла пры мантажы: калі папярэдняя сфакусаваная дошка знікла/схавалася.

  // клавіятура — толькі калі гульня ў ФОКУСЕ (апошні клік/тап быў тут), бачная і фокус не ў полі
  // ўводу (інакш стрэлкі ў суседняй форме пачалі б хадзіць па дошцы).
  // ⚠️ Слухач вешаецца на document, а DOM-вузел пры перарэндэры новы — таму спярша здымаем
  // папярэдні, інакш пасля дзясятка перамалёвак адзін націск рабіў бы дзясятак хадоў.
  if (st._key) document.removeEventListener('keydown', st._key);
  if (st.cfg.move) {
    st._key = e => {
      const d = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }[e.key];
      const el = document.getElementById(hostId);
      if (!d || !el) return;
      if (_gamesFocused !== hostId) return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '')) return;
      if (document.activeElement?.isContentEditable) return;
      if (!_gamesInView(el)) return;                                   // за кадрам — стрэлкі належаць СТАРОНЦЫ
      e.preventDefault();
      _gamesMove(hostId, d);
    };
    document.addEventListener('keydown', st._key);
  }

  // Увод на дошцы — адзін Pointer-шлях (мыш/тач/пяро), як драг-н-дроп дрэва. Тры жэсты
  // разводзяцца ПА ФАКЦЕ, а не па тыпе прылады: зрух > парога = свайп · доўгі тап = альтэрнатыўнае
  // дзеянне (сцяжок сапёра) · кароткі тап = клік па ячэйцы.
  const board = document.getElementById(hostId + '-board');
  let sx = 0, sy = 0, tracking = false, longT = null, longFired = false;
  const cellAt = e => {
    const c = e.target?.closest?.('.tg-cell');
    return (c && c.dataset.i !== undefined) ? +c.dataset.i : -1;
  };
  board.addEventListener('pointerdown', e => {
    sx = e.clientX; sy = e.clientY; tracking = true; longFired = false;
    if (st.cfg.onCellAlt) {
      const i = cellAt(e);
      clearTimeout(longT);
      longT = setTimeout(() => { longFired = true; if (i >= 0) _gamesCell(hostId, i, true); }, 500);
    }
  });
  board.addEventListener('pointermove', e => {
    if (!tracking) return;
    if (Math.abs(e.clientX - sx) > 16 || Math.abs(e.clientY - sy) > 16) clearTimeout(longT); // паехаў — гэта не доўгі тап
    // маляванне шляху: ячэйка пад пальцам, пакуль кнопка націснутая. `elementFromPoint`, бо на тачы
    // усе падзеі ідуць у вузел, дзе пачаўся жэст (pointer capture) — e.target быў бы заўжды першай ячэйкай.
    if (st.cfg.onCellEnter) {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const c = el?.closest?.('.tg-cell');
      const i = (c && c.dataset.i !== undefined) ? +c.dataset.i : -1;
      if (i >= 0 && i !== st._lastCell) { st._lastCell = i; if (st.cfg.onCellEnter(st, i)) _gamesPaint(hostId); }
    }
  });
  board.addEventListener('pointerup', e => {
    clearTimeout(longT);
    if (!tracking) return; tracking = false;
    st._lastCell = -1;
    if (st.cfg.onCellUp && st.cfg.onCellUp(st)) _gamesPaint(hostId);
    if (longFired) return;                                            // ужо спрацаваў доўгі тап
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) {                     // не свайп — значыць клік
      const i = cellAt(e);
      if (i >= 0 && st.cfg.onCell) _gamesCell(hostId, i, false);
      return;
    }
    if (st.cfg.move) _gamesMove(hostId, Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  });
  board.addEventListener('pointercancel', () => { clearTimeout(longT); tracking = false; st._lastCell = -1; });
  // правы клік — тое ж альтэрнатыўнае дзеянне, што доўгі тап (на мышы доўгі тап нязручны).
  // ⚠️ БАГ (знойдзена карыстальнікам 30.07, сцяжок сапёра «не ставіўся» на тачы): некаторыя
  // тач-браўзеры САМІ высылаюць нізавы `contextmenu` пасля доўгага тапу (побач з нашым таймерам
  // на 500мс). Без гэтай праверкі альтэрнатыўнае дзеянне спрацоўвала ДВАЧЫ — сцяжок ставіўся і
  // адразу ж здымаўся тым жа тогл-механізмам, візуальна «нічога не адбывалася».
  board.addEventListener('contextmenu', e => {
    if (!st.cfg.onCellAlt) return;
    e.preventDefault();
    if (longFired) return;                    // ужо адпрацавана нашым доўгім тапам — не дублюем
    const i = cellAt(e);
    if (i < 0) return;
    _gamesCell(hostId, i, true);
  });

  // ── ПАЛАТНО: паказальнік у долях (0..1) + кадравы цыкл ──────────────────────
  if (st.cfg.mode === 'canvas') {
    const cv = document.getElementById(hostId + '-canvas');
    // каардынаты ў ДОЛЯХ, а не ў пікселях: гульня не мусіць ведаць памер палатна, а ён залежыць
    // ад шырыні панэлі і ад devicePixelRatio — інакш кожная гульня перарахоўвала б гэта сама
    const rel = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
    // ⚠️ БАГ (знойдзена карыстальнікам 30.07, «тап па прагнозе нічога не робіць» у Кубіках/Манеце):
    // `&& !st.cfg.tick` тут скасоўваў перамалёўку для ЎСІХ canvas-гульняў з `tick` — а `tick`
    // сам маўчыць (вяртае false, кадравы цыкл не рэндэрыць), пакуль нічога не круціцца. Выбар
    // прагнозу мяняе стан, але без tick і без гэтага перамалявання экран не бачыў зьмену да
    // самага кідка. Перамалёўваем заўсёды, калі стан сапраўды змяніўся — лішні кадр падчас
    // актыўнага tick бясшкодны (той жа DOM/canvas рэндэр, што і кадравы цыкл дасць наступным тыкам).
    const send = (e, phase) => { if (!st.cfg.onPoint) return; const [x, y] = rel(e); if (st.cfg.onPoint(st, x, y, phase)) _gamesPaint(hostId); };
    // ✋ КНОПКІ-ЎТРЫМАННЯ (фліперы): ліва/права трымаюцца, а не націскаюцца. Штатны `move`-шлях
    // не падыходзіць — ён ведае толькі націск. Клавішы вешаем з keyup, на палатне бок вызначае
    // палова экрана. Гэта агульная здольнасць рухавіка, не асаблівасць пінбола.
    if (st.cfg.onHold) {
      if (st._hold) { document.removeEventListener('keydown', st._hold.d); document.removeEventListener('keyup', st._hold.u); }
      const side = e => ({ ArrowLeft: 'left', ArrowRight: 'right' })[e.key];
      const on = down => e => {
        const sd = side(e); const el = document.getElementById(hostId);
        if (!sd || !el || !_gamesInView(el)) return;                   // тая ж мерка: кіруе бачная дошка
        if (_gamesFocused !== hostId) return;                        // тыя ж стрэлкі не мусяць кіраваць ДРУГОЙ дошкай побач
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '')) return;
        e.preventDefault(); st.cfg.onHold(st, sd, down);
      };
      st._hold = { d: on(true), u: on(false) };
      document.addEventListener('keydown', st._hold.d); document.addEventListener('keyup', st._hold.u);
      cv.addEventListener('pointerdown', e => { const r = cv.getBoundingClientRect(); st.cfg.onHold(st, (e.clientX - r.left) / r.width < 0.5 ? 'left' : 'right', true); });
      const up = () => { st.cfg.onHold(st, 'left', false); st.cfg.onHold(st, 'right', false); };
      cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    }
    cv.addEventListener('pointerdown', e => { cv.setPointerCapture?.(e.pointerId); send(e, 'down'); });
    // ⚠️ БАГ (заўвага карыстальніка 30.07, Арканоід: «мышка выпадкова выйшла за поле — ракетка
    // спыняецца, мяч прайграны»): `pointermove` на самім canvas фізічна не спрацоўвае, калі курсор
    // фізічна па-за яго прамавугольнікам, — ракетка «замярзае» роўна там, дзе рука выйшла з палатна,
    // а мяч ляціць міма. Вешаем на `document`: рух мышы кіруе ракеткай ХОЦЬ ДЗЕ на старонцы, `rel()`
    // усё роўна лічыць долю ад canvas (клэмп у `onPoint` сам абмяжуе значэнне краямі). Слухач
    // прывязаны да `hostId`, не да DOM-вузла — стары абавязкова здымаецца, інакш пры перарэндэры
    // назапашацца некалькі, і адзін з іх будзе спасылацца на АДлучаны canvas (rel() вярнуў бы NaN).
    if (st._ptrMove) document.removeEventListener('pointermove', st._ptrMove);
    // ⚠️ Той жа гейт «у кадры»: document-шырокі pointermove не мусіць вадзіць ракетку дошкі,
    // якую чалавек ужо праскроліў (заўвага 31.07 — гульня рэагавала, будучы за экранам)
    st._ptrMove = e => { const el = document.getElementById(hostId); if (_gamesFocused === hostId && el && _gamesInView(el)) send(e, 'move'); };
    document.addEventListener('pointermove', st._ptrMove);
    cv.addEventListener('pointerup', e => send(e, 'up'));
  }
  // ⏱ Кадравы цыкл — для ЛЮБОЙ гульні з хукам `tick`, не толькі для палатна. Раней выклік стаяў
  // УНУТРЫ canvas-галіны, і сеткавая гульня з уласным тэмпам (Змейка) проста не ішла б: клавішы
  // мяняюць кірунак, а рухацца няма чаму. `_gamesLoop` сам гейтуе `if (!st.cfg.tick) return`.
  _gamesLoop(hostId);
}

// Кадравы цыкл — АДЗІН на гульню, спыняецца сам. Тры ўмовы выхаду, і ўсе патрэбныя:
// вузел знік (пайшлі ў іншы РМ) · стан замяніўся · дошка не бачная (згорнутая секцыя).
// Без гэтага цыкл круціўся б вечна ў фоне і еў бы батарэю ноўтбука пры зачыненай секцыі.
// На слабой машыне — 30 кадраў замест 60 (той жа вердыкт _perfWeak, што глушыць анімацыю).
function _gamesLoop(hostId) {
  const st = _gameStates[hostId];
  if (!st || !st.cfg.tick) return;
  if (st._raf) cancelAnimationFrame(st._raf);
  const minDt = _gamesPerfWeak() ? 33 : 16;
  let last = performance.now();
  const step = now => {
    const cur = _gameStates[hostId];
    const el = document.getElementById(hostId);
    if (cur !== st || !el || !_gamesVisible(el)) { st._raf = null; return; }
    const dt = Math.min(now - last, 50);                               // укладка была ў фоне → не даем фізіцы «скакнуць» на секунду
    if (dt >= minDt) { last = now; if (st.cfg.tick(st, dt) !== false) _gamesPaint(hostId); }
    st._raf = requestAnimationFrame(step);
  };
  st._raf = requestAnimationFrame(step);
}

// перамаляваць усе змантаваныя дошкі (напр. калі дамаляваўся асінхронны рэсурс)
function _gamesRepaintAll() { Object.keys(_gameStates).forEach(id => { if (document.getElementById(id)) _gamesPaint(id); }); }

// ці бачны кантэйнер (згорнутая секцыя / іншы РМ → клавіятура не наша)
function _gamesVisible(el) { return !!(el.offsetParent || el.getClientRects().length); }
// 👁 ЦІ ДОШКА Ў КАДРЫ ЭКРАНА (не проста «ў DOM»). ⚠️ Заўвага карыстальніка 31.07: на сайце ён
// праскроліў старонку, дошка знікла з вачэй — а стрэлкі ПА-РАНЕЙШАМУ хадзілі па 2048 замест таго,
// каб скроліць старонку. `_gamesVisible` правярае толькі `display:none`/адлучанасць, і на доўгай
// старонцы (сайт, Чарнавік) яна заўсёды праўдзівая. Кіраванне мусіць належаць таму, што чалавек
// БАЧЫЦЬ: за межамі кадра гульня клавіятуру не бярэ і аддае стрэлкі старонцы.
// Дапуск 40px — каб гульня, зрэзаная краем на пікселі, не «замярзала» пад пальцам.
function _gamesInView(el) {
  if (!_gamesVisible(el)) return false;
  const r = el.getBoundingClientRect();
  const h = window.innerHeight || document.documentElement.clientHeight;
  const w = window.innerWidth || document.documentElement.clientWidth;
  return r.bottom > 40 && r.top < h - 40 && r.right > 0 && r.left < w;
}

function _gamesMove(hostId, dir) {
  const st = _gameStates[hostId];
  if (!st || st.over || !st.cfg.move) return;
  if (st.cfg.move(st, dir)) _gamesPaint(hostId);
}
// клік / доўгі тап па ячэйцы — той жа кантракт «вярні true, калі поле змянілася»
function _gamesCell(hostId, i, alt) {
  const st = _gameStates[hostId];
  if (!st || st.over) return;
  const fn = alt ? st.cfg.onCellAlt : st.cfg.onCell;
  if (fn && fn(st, i)) _gamesPaint(hostId);
}

function gamesRestart(hostId) {
  const st = _gameStates[hostId];
  if (!st) return;
  clearTimeout(st._pendT); st._pending = null;   // недаробленых каскадаў ад мінулай партыі не пераносім
  clearTimeout(st._winT); st._winAt = 0;         // стары таймер банера не мусіць перамаляваць чужую (новую) партыю
  st._prev = [];                                 // без гэтага першы кадр новай партыі «лопнуў» бы старым полем
  st.cfg.init(st);
  _gamesPaint(hostId);
}

// ці слабая машына — пытаем ГАСПАДАРА (панэль ужо мае вердыкт `_perfWeak` па замеры FPS куба).
// Кампанент сам не мераe: другі замер на той жа старонцы — і лішні, і разышоўся б з першым.
function _gamesPerfWeak() { const h = window.TTZOP_GAMES_HOST; try { return !!(h && h.perfWeak && h.perfWeak()); } catch { return false; } }

// 📊 ТРЭЦІ ЛІЧЫЛЬНІК — неабавязковы і чыста канфігурацыйны: гульня дае `stat(st)`, надпіс бярэцца
// з `game_{id}_stat`. Патрэбны тым, у каго ёсць свой рэсурс (ходы ў «Кропках», а не толькі ачкі);
// рухавік малюе яго тым жа плітачным выглядам, што Рахунак і Рэкорд — новага UI не заводзім.
function _gamesStatPaint(hostId, st) {
  if (!st.cfg.stat) return;
  const el = document.getElementById(hostId + '-stat');
  if (el) el.textContent = st.cfg.stat(st);
}

// 🏁 Экран завяршэння — АДЗІН на сеткавыя гульні і на палатно.
// ⚠️ Быў толькі ў сеткавай галіне: гульня на палатне пры трох страчаных мячах проста ЗАМІРАЛА —
// мяч за краем, кадравы цыкл спынены, і ніводнага слова на дошцы (жывая заўвага карыстальніка 29.07:
// «усё завісае, толькі кнопка Нанова»). Стан быў правільны, не хапала менавіта паказу.
// 🕐 ЗАТРЫМКА ПЕРАД БАНЕРАМ (заўвага карыстальніка 30.07, «Злучы пункты»: выйгрышны расклад
// знікае занадта хутка). Банер клаўся паверх дошкі роўна ў той кадр, дзе стала `won`/`over` —
// гулец не паспяваў убачыць сам расклад. Першыя `_WIN_DELAY` мс дошка бачная САМА, толькі з
// кароткім пульсам рамкі (`.tg-win-flash`, гл. `_gamesPaint`/`_gamesPaintCanvas`); банер малюецца
// пасля. Таймер адзін на гульню (`st._winT`), паўторны выклік яго не множыць.
const _WIN_DELAY = 900;
// ⚠️ Заўвага карыстальніка 30.07 («Нанова»/«Гуляць далей» «не працуе» ў некалькіх гульнях): затрымка
// была ўключана нават для ЧЫСТАГА прайгрышу (over без won) — там няма чым любавацца, а карыстальнік
// клікаў ДА таго, як банер сапраўды з'явіўся, і гэта чыталася як «кнопка мёртвая». Затрымка мусіць
// быць толькі там, дзе ёсць што паказаць — пры сапраўднай ПЕРАМОЗЕ (`st.won`), не пры любым `over`.
function _gamesWinFlashing(st) { return !!(st._winAt && st.won && Date.now() - st._winAt < _WIN_DELAY); }
function _gamesOverHtml(hostId, st) {
  const done = st.over || st.won;
  if (!done) { st._winAt = 0; return ''; }
  if (st.won && !st._winAt) {
    st._winAt = Date.now();
    clearTimeout(st._winT);
    st._winT = setTimeout(() => _gamesPaint(hostId), _WIN_DELAY + 30);
  }
  if (st.won && Date.now() - st._winAt < _WIN_DELAY) return '';         // яшчэ ў акне «пакажы расклад» (толькі для перамогі)
  if (st.over) return `<div class="tg-over${st.won ? ' tg-win' : ''}">${_gTGame(st.id, st.won ? 'win' : 'over')}`
    + `<button class="tg-btn" onclick="gamesRestart('${hostId}')">${_gT('game_new')}</button></div>`;
  if (st.won && !st._wonSeen) return `<div class="tg-over tg-win">${_gTGame(st.id, 'win')}`
    + `<button class="tg-btn" onclick="_gamesDismissWin('${hostId}')">${_gT('game_continue')}</button></div>`;
  return '';
}

// здымак значэння ячэйкі для параўнання «змянілася ці не» (лічба — як ёсць, аб'ект — серыялізаваны)
function _gCellKey(v) { return (v && typeof v === 'object') ? JSON.stringify(v) : v; }

// 🎨 АДЗІНАЯ палітра фішак на ЎСЕ гульні (дыяменты, шары, кропкі, шляхі).
// ⚠️ Было чыстае `hsl(h 62% 52%)` — і фішкі «крычалі»: на іх прападала рамка вылучэння, не відаць
// было, што выбрана (заўвага карыстальніка 29.07). Прыглушаем ДВОЙЧЫ: нізкая насычанасць +
// падмешванне фону панэлі. Правім тут — мяняецца ва ўсіх гульнях адразу, а не ў адной.
// `raw` — для палатна: color-mix там не працуе, патрэбны гатовы колер.
// ⚠️ Роўны крок па коле (360/n) даваў СУСЕДНІЯ адценні: пры сямі колерах зялёны і бірузовы
// адрозніваліся на 51° і зліваліся ў вачах (заўвага карыстальніка 29.07). Таму хады выбраны
// рукамі, з разрывамі там, дзе вока блытае. Спіс адзін на ўсе гульні — правіш тут, мяняецца ўсюды.
// ⚠️ ПЕРАРАБЛЕНЫ 30.07 (скрыншот карыстальніка, «Лініі»: зялёны і жоўта-зялёны шар амаль
// неадрозныя). Стары спіс [0,40,75,110,...] меў ажно тры разрывы па 35° запар менавіта ў
// цёпла-зялёнай зоне (0→40→75→110) — там, дзе чалавечае вока горш адрознівае колер увогуле.
// Пры n=5..8 (сапёр-суседзі, дыяменты, лініі) `_gColor` вымушана бярэ БОЛЬШ за палову хадоў, і
// гэты цесны кластар трапляў туды заўсёды. Новы спіс мае мінімальны разрыў 40° УСЮДЫ (правеpaна
// для ЎСІХ n ад 3 да 8), не толькі для n=4 (Флоу), якое правілі ўчора.
const _G_HUES = [0, 45, 100, 150, 190, 230, 275, 320];
// ⚠️ БАГ (скрыншот карыстальніка 30.07, «Злучы пункты»: колеры дзвюх-трох пар зліваліся ў вока):
// параметр `n` («колькі розных колераў у гэтай гульні») раней НІКОЛІ не ўдзельнічаў у разліку —
// заўсёды бралася `(i-1) % 8`, гэта значыць ПАДРАД з пачатку спісу. Для гульні з n=4 (Флоу) гэта
// чатыры ПЕРШЫЯ хады (0,40,75,110) — а яны ўсе ляжаць у адным і тым жа «цёплым» кутку кола (чырвоны
// → аранжавы → жоўта-зялёны → зялёны), дзе чалавечае вока горш адрознівае адценні, чым у
// сіне-фіялетавай частцы. Астатнія 4 гатовыя хады (175,215,270,318) пры гэтым увогуле не
// выкарыстоўваліся. Цяпер `n` РАЗМЯРКОЎВАЕ выбар роўна па ЎСІМ 8 хадам — пры n=4 гэта
// 0,75,175,270 (чырвоны/жоўта-зялёны/бірузовы/фіялетавы), а не чатыры суседнія цёплыя тоны.
function _gColor(i, n, raw) {
  const span = n > 0 ? n : _G_HUES.length;
  const idx = Math.round((((i - 1) % span + span) % span) * _G_HUES.length / span) % _G_HUES.length;
  const h = _G_HUES[idx];
  // зялёна-бірузовая паласа пры адной і той жа яснасці чытаецца святлейшай за чырвань і сінь —
  // прыцямняем яе, інакш «зялёны» выглядае як бледная мята побач з бірузой
  const l = (h > 80 && h < 200) ? 44 : 54;
  // ⚠️ Падмешванне фону было 72% — на ЦЁМНАЙ тэме фішкі правальваліся ў фон і ледзь чыталіся
  // (скрыншот карыстальніка 29.07). 88% пакідае колер жывым, а «не крычыць» цяпер забяспечвае
  // сама насычанасць (48%, не 62%) — прыглушаць двойчы аказалася лішнім.
  return raw ? `hsl(${h} 52% ${l}%)` : `color-mix(in srgb, hsl(${h} 48% ${l}%) 88%, var(--surface))`;
}

// Малюнак кадра на палатне. Памер задаецца ТУТ, а не ў гульні: палатно квадратнае па шырыні
// кантэйнера і множыцца на devicePixelRatio (інакш на рэтыне ўсё размытае). Гульня малюе
// ў лагічных пікселях і пра маштаб не ведае.
function _gamesPaintCanvas(hostId, st) {
  const cv = document.getElementById(hostId + '-canvas');
  if (!cv || !st.cfg.draw) return;
  const box = cv.parentElement.getBoundingClientRect();
  // ⚠️ Палатно было заўсёды КВАДРАТНЫМ. Пінбольны стол вертыкальны, і на квадраце ён або
  // сціскаецца, або абразаецца. `aspect` (вышыня/шырыня) — пер-гульнявы, дэфолт 1.
  const w = Math.max(1, Math.round(box.width)), h = Math.round(w * (st.cfg.aspect || 1));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);              // >2 нічога не дадае воку, але множыць працу ў 2+ разы
  if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.width = w + 'px'; cv.style.height = h + 'px'; }
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  st.cfg.draw(st, ctx, w, h);
  // экран завяршэння — DOM-накладка над палатном (той жа `.tg-over`, што ў сеткавых гульняў):
  // кнопка «Нанова» мусіць быць клікабельнай, а намаляваная на канве яна ёй не была б
  const html = _gamesOverHtml(hostId, st);
  let ov = cv.parentElement.querySelector('.tg-over');
  if (html && !ov) { cv.parentElement.insertAdjacentHTML('beforeend', html); }
  else if (!html && ov) { ov.remove(); }
  cv.parentElement.classList.toggle('tg-win-flash', _gamesWinFlashing(st)); // пульс, пакуль банер яшчэ не паказаны
  _gamesStatPaint(hostId, st);
  const sc = document.getElementById(hostId + '-score');
  if (sc) sc.textContent = st.score;
  const best = _gameBestGet(st.id);
  const lower = !!st.cfg.lowerIsBetter;
  if (lower ? (st.won && st.score > 0 && (!best || st.score < best)) : st.score > best) {
    _gameBestSet(st.id, st.score); const b = document.getElementById(hostId + '-best'); if (b) b.textContent = st.score;
  }
}
// колер з CSS-зменнай тэмы — палатно не разумее var(), таму спытаем вылічаны стыль.
// Кэш на гульню: getComputedStyle у кожным кадры каштуе рэфлоў.
function _gCss(name, fallback) {
  _gCss._c = _gCss._c || {};
  if (_gCss._c[name]) return _gCss._c[name];
  let v = '';
  try { v = getComputedStyle(document.documentElement).getPropertyValue(name).trim(); } catch {}
  return (_gCss._c[name] = v || fallback);
}

function _gamesPaint(hostId) {
  const st = _gameStates[hostId];
  const board = document.getElementById(hostId + '-board');
  if (!st || !board) return;
  if (st.cfg.mode === 'canvas') { _gamesPaintCanvas(hostId, st); return; }
  const n = st.cfg.size;
  board.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
  // 🎬 што менавіта змянілася з мінулай перамалёўкі — толькі гэтым ячэйкам анімацыя з'яўлення.
  // Параўнанне са здымкам, а не сцяг у логіцы гульні: рухавік не мусіць ведаць ПРАВІЛАЎ (адкуль
  // узялася лічба — новая плітка ці зліццё), яму хапае факта «стала іншай». На слабой машыне —
  // без анімацыі зусім (той жа вердыкт, што глушыць афармленне куба).
  // ⚠️ Ячэйка бывае не толькі лічбай: у сапёра гэта аб'ект {міна, адкрыта, сцяжок}. Параўноўваем
  // па ЗДЫМКУ значэння, інакш аб'екты заўсёды «розныя» і ўся дошка міргала б анімацыяй кожны ход.
  const prev = st._prev || [];
  const cur = (st.grid || []).map(_gCellKey);
  const weak = _gamesPerfWeak();
  const pop = weak ? [] : cur.map((k, i) => st.grid[i] && k !== prev[i]);
  // 💥 ЗНІКЛА — ячэйка была занятая, стала пустая. Рухавік бачыць гэта сам, з таго ж параўнання
  // здымкаў, і сам дамалёўвае «лопанне»: гульня пра анімацыю не ведае, а атрымліваюць яе ЎСЕ
  // (лініі, дыяменты, любая будучая). Пусты першы кадр не лічым — інакш пры старце лопнула б
  // усё поле адразу.
  // ⚠️ Заўвага карыстальніка 30.07 (2048: «лопанне» спрацоўвае нават калі клетка проста пераехала,
  // а не знікла): здымак-параўнанне бачыць толькі «была занятая → стала пустая» і не ведае, ЧАМУ —
  // плітка сапраўды знікла (зліццё/лопанне) ці проста перамясцілася ў суседнюю ячэйку тым жа ходам.
  // Для гульняў, дзе значэнні ЕДУЦЬ па полі (2048, пятнашкі), гэтае адрозненне рухавіку недаступнае
  // ў прынцыпе — таму такія гульні самі кажуць `noBurst: true`, і мы проста не малюем эфект.
  const gone = (weak || !prev.length || st.cfg.noBurst) ? [] : cur.map((k, i) => !st.grid[i] && prev[i]);
  st._prev = cur;
  // ⚠️ Надпіс перамогі — ПЕР-ГУЛЬНЯВЫ (`_gTGame`). Быў агульны `game_win`, а яго тэкст пісаўся пад
  // 2048 — і «Злучы пункты» віншавала словам «2048! 🎉» (жывы баг, скрыншот карыстальніка 29.07).
  // Агульны ключ застаецца фолбэкам для тых, каму асобны тэкст не патрэбны.
  const over = _gamesOverHtml(hostId, st);
  // data-i — індэкс ячэйкі для клікаў: ставіць РУХАВІК, каб гульня не мусіла помніць пра разметку
  board.innerHTML = st.grid.map((v, i) => st.cfg.cellHtml(v, !!pop[i], i, st)).join('') + over;
  _gamesChainPaint(board, st);                                         // 🖍 лінія па ланцужку (гульня дае хук `chain`)
  [...board.querySelectorAll('.tg-cell')].forEach((c, i) => { c.dataset.i = i; if (gone[i]) c.classList.add('tg-burst'); });
  board.classList.toggle('tg-noanim', weak); // слабая машына — без скокаў і лопання (той жа вердыкт, што ў куба)
  board.classList.toggle('tg-win-flash', _gamesWinFlashing(st)); // пульс рамкі, пакуль банер яшчэ не паказаны
  // ⏭ АДКЛАДЗЕНЫ КРОК: гульня можа сказаць «намалюй гэта, а праз імгненне зрабі вось так» —
  // так каскад робіцца бачным (зняць → паказаць пустэчу → уроніць), а не адбываецца ў адзін кадр.
  // Механізм у рухавіку, каб любая будучая гульня з ланцужкамі атрымала яго задарма.
  // Адзін таймер на гульню: паўторны выклік перабівае папярэдні, ланцужкі не назапашваюцца.
  clearTimeout(st._pendT);
  if (st._pending) {
    st._pendT = setTimeout(() => {
      const f = st._pending; st._pending = null;
      if (f && f(st) !== false) _gamesPaint(hostId);
    }, weak ? 60 : (st._pendingMs || 190));                            // на слабой машыне не марудзім
  }
  _gamesStatPaint(hostId, st);
  const sc = document.getElementById(hostId + '-score');
  if (sc) sc.textContent = st.score;
  // 🏆 «Лепш» залежыць ад гульні: у 2048 больш = лепш, у пятнашках менш хадоў = лепш.
  // Прызнаём рэкорд толькі па ЗАВЕРШАНАЙ партыі там, дзе меней-лепш: інакш нуль хадоў
  // на старце адразу стаў бы недасяжным «рэкордам».
  const best = _gameBestGet(st.id);
  const lower = !!st.cfg.lowerIsBetter;
  const better = lower ? (st.won && st.score > 0 && (!best || st.score < best)) : st.score > best;
  if (better) {
    _gameBestSet(st.id, st.score);
    const b = document.getElementById(hostId + '-best');
    if (b) b.textContent = st.score;
  }
}
// 🏔 УЗРОЎНІ (30.07, «складанасць узроўняў трэба абавязкова» — заўвага карыстальніка). Пераклад
// той жа кнопкі «Гуляць далей», што ўжо існавала для 2048 (прайшоў 2048 — можаш гуляць далей на
// тым жа полі): калі ў гульні ёсць `nextLevel(st)`, дысмісс не проста хавае банер, а просіць гульню
// пабудаваць складанейшы расклад і працягвае партыю. Гульні БЕЗ `nextLevel` (2048 і ўсе астатнія)
// паводзяцца як раней — банер проста хаваецца.
function _gamesDismissWin(hostId) {
  const st = _gameStates[hostId];
  if (!st) return;
  if (st.cfg.nextLevel) { clearTimeout(st._winT); st._winAt = 0; st.level = (st.level || 1) + 1; st.won = false; st.cfg.nextLevel(st); }
  else st._wonSeen = true;
  _gamesPaint(hostId);
}

// 🖍 ЛІНІЯ ПА ЛАНЦУЖКУ — генерычны хук `chain(st)` → масіў індэксаў ячэек, якія трэба злучыць.
// ⚠️ Заўвага карыстальніка 30.07 («Кропкі: не малюецца лінія, калі вяду мышкай па шарыках»): падсветка
// ячэек ёсць, а самой лініі не было — без яе не відаць, які менавіта шлях ты вядзеш і дзе ён загнуўся.
// Малюем SVG-накладкай ПА РЭАЛЬНЫХ каардынатах ячэек (getBoundingClientRect), а не па долях сеткі:
// у дошкі ёсць `gap`, і разлік «па долях» даваў бы лінію міма цэнтраў. Механізм у рухавіку — любая
// будучая гульня са шляхам атрымае яго, дадаўшы адзін хук.
function _gamesChainPaint(board, st) {
  const ids = (typeof st.cfg.chain === 'function' ? st.cfg.chain(st) : null) || [];
  if (ids.length < 2) return;
  const br = board.getBoundingClientRect();
  const pts = ids.map(i => {
    const el = board.children[i]; if (!el) return null;
    const r = el.getBoundingClientRect();
    return [r.left - br.left + r.width / 2, r.top - br.top + r.height / 2];
  }).filter(Boolean);
  if (pts.length < 2) return;
  const acc = _gCss('--accent', '#f97316');
  board.insertAdjacentHTML('beforeend',
    `<svg style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible" viewBox="0 0 ${br.width} ${br.height}">`
    + `<polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="${acc}" stroke-width="6" `
    + `stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/></svg>`);
}

// ── стылі: адзін раз на старонку, цалкам на CSS-зменных гаспадара ──────────────
// Ніводнага зашытага колеру і ніводнага знешняга шрыфта — таму гульня аўтаматычна
// трапляе ў тэму панэлі, цёмны рэжым і любы будучы выгляд.
function _gamesEnsureStyle() {
  if (document.getElementById('tg-style')) return;
  const st = document.createElement('style');
  st.id = 'tg-style';
  st.textContent = `
    .tg-wrap { max-width: 420px; }
    .tg-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
    .tg-stat { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius);
      padding: 4px 10px; display: flex; flex-direction: column; line-height: 1.15; min-width: 68px; }
    .tg-stat-l { font-size: 0.66rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
    .tg-stat-v { font-size: 1.05rem; font-weight: 700; color: var(--text); }
    .tg-btn { margin-left: auto; background: var(--accent); color: #fff; border: 0; border-radius: var(--radius);
      padding: 7px 14px; font: inherit; font-weight: 600; cursor: pointer; }
    .tg-btn:hover { filter: brightness(1.08); }
    /* ⚠️ Заўвага карыстальніка 30.07 («Лініі»: занадта вялікая адлегласць паміж клеткамі, прападае
       месца) — зазор 8px→4px, водступ дошкі 8px→6px. Механізм агульны на ЎСЕ сеткавыя гульні
       (Сапёр/Гемы/Лініі/Кропкі і інш.) — клеткі і шарыкі (% ад клеткі) сталі буйнейшыя ўсюды разам. */
    .tg-board { position: relative; display: grid; gap: 4px; background: var(--surface2);
      border: 1px solid var(--border); border-radius: var(--radius); padding: 6px; touch-action: none; user-select: none; }
    .tg-cell { position: relative; aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
      border-radius: var(--radius); font-weight: 700; color: var(--text); }
    .tg-empty { background: var(--surface); }
    .tg-over { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 12px; background: color-mix(in srgb, var(--surface) 82%, transparent);
      border-radius: var(--radius); font-size: 1.15rem; font-weight: 700; color: var(--text); }
    .tg-over .tg-btn { margin-left: 0; }
    .tg-win { color: var(--success); }
    .tg-hint { margin-top: 8px; font-size: 0.78rem; color: var(--muted); }
    /* 🎬 з'яўленне пліткі — перанесена са старога games/TTZOP-2048.html (@keyframes pop).
       Кароткая і без руху макета: анімуецца толькі transform, таму не выклікае reflow. */
    @keyframes tg-pop { 0% { transform: scale(0.72); } 60% { transform: scale(1.06); } 100% { transform: scale(1); } }
    .tg-pop { animation: tg-pop 0.16s ease-out; }
    /* 🎬 зліццё (2048, заўвага карыстальніка 30.07): прыкметнейшы пульс за звычайны tg-pop — гэта
       сапраўдная падзея (дзве пліткі сталі адной), а не проста плітка прыехала, таму рэакцыя
       мусіць адчувацца мацней. Стан st._merged кажа рухавіку, якая ячэйка гэтым ходам зліта. */
    @keyframes tg-merge { 0% { transform: scale(1); } 40% { transform: scale(1.22); } 100% { transform: scale(1); } }
    .tg-merge { animation: tg-merge 0.22s ease-out; z-index: 1; }
    @media (prefers-reduced-motion: reduce) { .tg-pop, .tg-merge { animation: none; } }
    /* сапёр: закрытая / адкрытая / міна — усё на зменных тэмы, як і плітка 2048 */
    .tg-hidden { background: color-mix(in srgb, var(--accent) 22%, var(--surface)); cursor: pointer; font-size: 1rem; }
    .tg-hidden:hover { background: color-mix(in srgb, var(--accent) 34%, var(--surface)); }
    .tg-open { background: var(--surface); font-size: 1rem; }
    .tg-mine { background: var(--error); color: #fff; }
    /* 🫧 выбраны шар лёгка падскоквае — відаць, ЧЫМ ходзіш, нават калі рамка зліваецца з фонам.
       Анімуецца ўнутраны кружок, не сама ячэйка: сетка застаецца нерухомай. */
    @keyframes tg-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14%); } }
    /* 🎯 Выбраная ячэйка — РАМКА на самой клетцы. ⚠️ Заўвага карыстальніка 30.07 («Тры ў рад: клікаю,
       а не відаць, якая клетка будзе рухацца»): раней выбар паказваўся ТОЛЬКІ скачком унутранага
       span — а ў gems ніякага span няма (◆ малюецца тэкстам у самой клетцы), і выбар быў нябачны
       зусім. Рамка не залежыць ад разметкі гульні, таму працуе ва ЎСІХ — цяперашніх і будучых. */
    .tg-sel { outline: 3px solid var(--accent, #f97316); outline-offset: -3px; border-radius: var(--radius, 8px); }
    .tg-sel > span { animation: tg-bounce 0.62s ease-in-out infinite; }
    /* 💥 фішка лопаецца — кола акцэнту разыходзіцца і растае на месцы знікшай */
    @keyframes tg-burst { 0% { transform: scale(0.55); opacity: 0.85; } 100% { transform: scale(1.5); opacity: 0; } }
    .tg-burst::after { content: ''; position: absolute; inset: 12%; border-radius: 50%;
      background: var(--accent); animation: tg-burst 0.3s ease-out forwards; pointer-events: none; }
    .tg-noanim .tg-sel > span, .tg-noanim .tg-burst::after, .tg-noanim .tg-pop, .tg-noanim .tg-merge { animation: none; }
    /* 🏆 пульс перамогі (заўвага карыстальніка 30.07, «Злучы пункты»: банер закрываў расклад
       занадта хутка) — рамка гульні пульсуе акцэнтам, ПАКУЛЬ банер яшчэ не паказаны (гл. WIN_DELAY
       і _gamesWinFlashing вышэй па файле): гулец паспявае ўбачыць і сам расклад, і сігнал, што ён
       правільны, а не проста нічога не адбываецца падчас паўзы. */
    @keyframes tg-win-flash { 0%, 100% { box-shadow: 0 0 0 0 transparent; } 50% { box-shadow: 0 0 0 5px color-mix(in srgb, var(--accent) 60%, transparent); } }
    .tg-win-flash { animation: tg-win-flash 0.5s ease-in-out infinite; }
    .tg-noanim.tg-win-flash { animation: none; box-shadow: 0 0 0 5px color-mix(in srgb, var(--accent) 60%, transparent); }
    @media (prefers-reduced-motion: reduce) { .tg-win-flash { animation: none; } }
    /* ⚠️ Заўвага карыстальніка 30.07 («Лініі»): рамка выбару была занадта яркай/тоўстай і, галоўнае,
       залішняй — унутраны span УЖО скача (.tg-sel больш span, ніжэй) роўна тады, калі выбраны, і
       гэтага дастаткова, каб бачыць, ЯКІ шарык рухаецца. Механізм агульны (Гемы/Кропкі/Лініі), тут
       правім РАЗ — рамкі больш нідзе, толькі скачок. */
    .tg-board .tg-cell { cursor: pointer; }
    /* палатно: квадрат па шырыні кантэйнера; touch-action ужо знято на .tg-board (свайп не скроліць) */
    /* line-height:0 прыбірае зазор пад <canvas> (inline-элемент), АЛЕ ён атрымліваўся ў спадчыну
       экранам завяршэння — і кнопка «Нанова» на палатне сціскалася ў палоску (заўвага 29.07).
       Таму нуль толькі самому кантэйнеру, а ўнутры тэксту вяртаем нармальную вышыню радка. */
    .tg-board-canvas { display: block; padding: 0; line-height: 0; }
    .tg-board-canvas .tg-over { line-height: 1.35; }
    .tg-board-canvas canvas { display: block; width: 100%; border-radius: var(--radius); cursor: pointer; }`;
  document.head.appendChild(st);
}

// экспарт у глабальную вобласць (панэль і сайт клічуць адны і тыя ж імёны)
window.TTZOP_GAMES = GAMES;
window.gamesBodyHtml = gamesBodyHtml;
window.gamesInit = gamesInit;
window.gamesFocus = gamesFocus;   // гаспадар кажа, якая дошка актыўная (у панэлі — той жа вузел, што ў рамцы)
window.gamesRestart = gamesRestart;
window._gamesDismissWin = _gamesDismissWin;
