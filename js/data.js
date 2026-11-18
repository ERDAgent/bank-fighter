/* Bank Fighter — shared data: roster, moves, legislation finishers.
   Used by both the game and the website pages. */
(function () {
  const BF = (window.BF = window.BF || {});

  // box = [forward offset, top (relative to feet), width, height]
  BF.NORMALS = {
    sp: { key: 'sp', name: 'MARGIN CALL', input: 'P', su: 4, act: 3, rec: 8, dmg: 5, box: [8, -50, 28, 12], h: 'mid', pose: 'punch', push: 2.5, stun: 14,
      def: 'A broker\'s demand that you post more collateral, right now.', fx: 'Fast standing jab.' },
    sk: { key: 'sk', name: 'SHORT SELL', input: 'K', su: 7, act: 4, rec: 13, dmg: 8, box: [8, -40, 32, 14], h: 'mid', pose: 'kick', push: 3.5, stun: 17,
      def: 'Selling borrowed shares, betting the price will fall.', fx: 'Standing kick with reach.' },
    cp: { key: 'cp', name: 'HAIRCUT', input: '↓ + P', su: 6, act: 4, rec: 18, dmg: 11, box: [4, -70, 24, 40], h: 'mid', pose: 'upper', launch: [1.4, -5.6],
      def: 'The discount applied to an asset\'s value when it is used as collateral.', fx: 'Crouching uppercut. Launches.' },
    ck: { key: 'ck', name: 'WRITE-DOWN', input: '↓ + K', su: 8, act: 4, rec: 16, dmg: 7, box: [6, -14, 34, 14], h: 'low', pose: 'sweep', kd: true,
      def: 'Reducing the book value of an asset that is no longer worth what you claimed.', fx: 'Low sweep. Must be blocked crouching. Knocks down.' },
    jp: { key: 'jp', name: 'DEAD CAT BOUNCE', input: 'JUMP, P', su: 4, act: 14, rec: 0, dmg: 7, box: [2, -44, 26, 30], h: 'over', pose: 'airP', push: 2.5, stun: 16,
      def: 'A brief recovery in a falling stock before it resumes falling.', fx: 'Jumping punch. Must be blocked standing.' },
    jk: { key: 'jk', name: 'HOSTILE TAKEOVER', input: 'JUMP, K', su: 5, act: 14, rec: 0, dmg: 9, box: [4, -32, 32, 24], h: 'over', pose: 'airK', push: 3, stun: 18,
      def: 'Acquiring a company against the wishes of its management.', fx: 'Jumping kick. Must be blocked standing.' }
  };

  BF.UNIVERSAL = [
    { name: 'GOLDEN PARACHUTE', input: 'HOLD BLOCK IN AIR',
      def: 'A lavish payout guaranteed to an executive who is pushed out.', fx: 'Deploys a golden canopy. You drift down slowly and safely, no matter how badly things went.' }
  ];

  const S = (o) => Object.assign({ sp: true, su: 12, act: 1, rec: 20, h: 'mid' }, o);

  BF.FIGHTERS = {
    enron: {
      id: 'enron', name: 'ENRON', full: 'Enron Corporation', mascot: 'The Rainmaker', hq: 'Houston, Texas', fell: '2001',
      tagline: 'ASK WHY. THEN SHRED IT.',
      bio: 'An energy trader that booked imagined future profits today using mark-to-market accounting and hid its debt in off-balance-sheet special purpose entities. It filed for Chapter 11 on December 2, 2001, then the largest U.S. bankruptcy, and took its auditor Arthur Andersen down with it.',
      mascotBio: 'A slick trading-floor closer in mirrored shades who can make a liability vanish by standing somewhere else.',
      stage: 'houston', head: 'slick', speed: 1.75, bw: 11, th: 4,
      pal: { skin: '#f2c19a', suit: '#2a4a9c', dark: '#1a2f66', pants: '#22366e', shoe: '#111', hair: '#3a2a1a', front: '#fff', accent: '#e23d3d' },
      specials: [
        S({ name: 'MARK-TO-MARKET', cmd: '236P', type: 'proj', kind: 'arrow', dmg: 9, speed: 3.2,
          def: 'Valuing an asset at its current market price. Enron applied it to deals whose "market price" it made up.', fx: 'Fires a profit chart that has not happened yet.' }),
        S({ name: 'OFF-BALANCE SHEET', cmd: '214K', type: 'tele', su: 8, act: 10, rec: 12,
          def: 'Assets or debts kept out of a company\'s reported balance sheet.', fx: 'Vanishes and reappears behind the opponent.' }),
        S({ name: 'DERIVATIVE', cmd: '22P', type: 'rise', dmg: 13, su: 5, rec: 14,
          def: 'A contract whose value is derived from some other underlying asset.', fx: 'Rising uppercut. Beats jump-ins.' })
      ]
    },
    worldcom: {
      id: 'worldcom', name: 'WORLDCOM', full: 'WorldCom, Inc.', mascot: 'The Lineman', hq: 'Clinton, Mississippi', fell: '2002',
      tagline: 'OPERATING COSTS? NEVER HEARD OF THEM.',
      bio: 'A telecom giant that hid billions in ordinary line costs by recording them as capital investments, inflating profits by roughly $11 billion. Its own internal audit team, led by Cynthia Cooper, uncovered the fraud. It filed for bankruptcy on July 21, 2002.',
      mascotBio: 'A hard-hatted cable jockey who turns every expense into an asset and every asset into a weapon.',
      stage: 'serverfarm', head: 'hardhat', speed: 1.6, bw: 12, th: 5,
      pal: { skin: '#e8b48c', suit: '#e8762a', dark: '#a34d14', pants: '#2c4a6e', shoe: '#3a2a1a', hair: '#5a3a1a', front: '#f6e23a', accent: '#f6e23a' },
      specials: [
        S({ name: 'EBITDA', cmd: '236P', type: 'proj', kind: 'text', label: 'EBITDA', dmg: 9, speed: 2.8, pw: 34, ph: 8,
          def: 'Earnings Before Interest, Taxes, Depreciation and Amortization. Profit, minus the inconvenient parts.', fx: 'Throws the acronym itself.' }),
        S({ name: 'CAPITALIZED EXPENSE', cmd: '214K', type: 'dash', dmg: 11, speed: 4.2, act: 14,
          def: 'Recording a cost as a long-term asset instead of an expense, spreading it over years.', fx: 'Shoulder charge across the screen.' }),
        S({ name: 'WHISTLEBLOWER', cmd: '22P', type: 'shock', dmg: 7, stun: 55, range: 56, su: 10, act: 6, rec: 24,
          def: 'An insider who reports wrongdoing. WorldCom\'s fraud was exposed by its own internal auditors.', fx: 'Piercing close-range blast. Stuns on hit.' })
      ]
    },
    bear: {
      id: 'bear', name: 'BEAR STEARNS', full: 'The Bear Stearns Companies', mascot: 'The Bear', hq: 'New York, New York', fell: '2008',
      tagline: 'TWO DOLLARS A SHARE.',
      bio: 'An 85-year-old investment bank leveraged heavily into mortgage-backed securities. After two of its hedge funds collapsed in 2007 and lenders pulled their funding, it was sold to JPMorgan Chase in March 2008 in a Fed-backed fire sale, first priced at $2 a share and later raised to $10.',
      mascotBio: 'An actual bear in a pinstripe suit. Heavy, slow, and borrowing against everything in the room.',
      stage: 'trading', head: 'bear', speed: 1.4, bw: 15, th: 6,
      pal: { skin: '#8a5a2e', suit: '#3a3a44', dark: '#22222a', pants: '#2c2c34', shoe: '#5a3a1e', hair: '#6e4520', front: '#d8d8e0', accent: '#b02a2a' },
      specials: [
        S({ name: 'CREDIT DEFAULT SWAP', cmd: '236P', type: 'proj', kind: 'swap', dmg: 8, speed: 2.6, onHit: 'swap',
          def: 'Insurance-like contract that pays out if a borrower defaults. You can buy it on debt you do not own.', fx: 'On hit, both fighters swap positions.' }),
        S({ name: 'LEVERAGED BUYOUT', cmd: '214K', type: 'dash', dmg: 16, speed: 4.6, act: 14, selfDmg: 4, kd: true,
          def: 'Buying a company mostly with borrowed money, secured against the company being bought.', fx: 'Huge charge. Costs some of your own health, hit or miss.' }),
        S({ name: 'BEAR MARKET', cmd: '22P', type: 'pound', dmg: 10, range: 120, su: 16, rec: 26, h: 'low',
          def: 'A prolonged market decline of 20% or more.', fx: 'Ground pound. Shockwave hits anyone standing nearby.' })
      ]
    },
    lehman: {
      id: 'lehman', name: 'LEHMAN', full: 'Lehman Brothers Holdings', mascot: 'The Senior Partner', hq: 'New York, New York', fell: '2008',
      tagline: 'LEVERAGED THIRTY TO ONE.',
      bio: 'Founded in 1850, Lehman rode the mortgage boom at roughly 30-to-1 leverage and used "Repo 105" transactions to make its balance sheet look smaller at quarter end. It filed for bankruptcy on September 15, 2008 with $639 billion in assets, still the largest in U.S. history.',
      mascotBio: 'An old-money banker in a bowler hat, 158 years old and one bad quarter from a cardboard box.',
      stage: 'seventh', head: 'bowler', speed: 1.65, bw: 11, th: 4,
      pal: { skin: '#f0c8a8', suit: '#1e5a3c', dark: '#123a26', pants: '#18402c', shoe: '#111', hair: '#c8c8c8', front: '#fff', accent: '#d8b040' },
      specials: [
        S({ name: 'JUNK BOND', cmd: '236P', type: 'proj', kind: 'paper', dmg: 10, speed: 2.6, pvy: -3.4, grav: 0.14,
          def: 'A high-yield bond rated below investment grade because the issuer may not pay it back.', fx: 'Lobbed in an arc. Goes over other projectiles.' }),
        S({ name: 'LEVERAGE', cmd: '214K', type: 'dash', dmg: 12, speed: 5.2, act: 11,
          def: 'Using borrowed money to amplify returns. And losses.', fx: 'Very fast lunge.' }),
        S({ name: 'REPO 105', cmd: '22P', type: 'heal', amt: 9, su: 26, rec: 22,
          def: 'Lehman\'s trick of booking short-term loans as "sales" to hide debt at quarter end.', fx: 'Hides the damage. Restores health, but leaves you wide open.' })
      ]
    },
    theranos: {
      id: 'theranos', name: 'THERANOS', full: 'Theranos, Inc.', mascot: 'The Nanotainer', hq: 'Palo Alto, California', fell: '2018',
      tagline: 'ONE DROP CHANGES EVERYTHING.',
      bio: 'A blood-testing startup once valued at $9 billion on the claim that it could run hundreds of tests from a single finger-prick. The technology never worked. Reporting in 2015 unraveled it, the company dissolved in 2018, and its founder was convicted of fraud in 2022.',
      mascotBio: 'A walking sample vial in a black turtleneck. Results may vary. Wildly.',
      stage: 'lab', head: 'vial', speed: 1.85, bw: 10, th: 4,
      pal: { skin: '#f2d2b8', suit: '#18181c', dark: '#08080a', pants: '#18181c', shoe: '#000', hair: '#000', front: '#18181c', accent: '#d8203a' },
      specials: [
        S({ name: 'ONE DROP', cmd: '236P', type: 'proj', kind: 'drop', dmg: 6, speed: 4.6, su: 9, rec: 16, pw: 6, ph: 6,
          def: 'All the blood Theranos said it needed.', fx: 'Tiny, very fast projectile.' }),
        S({ name: 'VAPORWARE', cmd: '214K', type: 'tele', su: 8, act: 10, rec: 12,
          def: 'A product announced and sold to investors that does not actually exist.', fx: 'Vanishes and reappears behind the opponent.' }),
        S({ name: 'HETEROSKEDASTICITY', cmd: '22P', type: 'proj', kind: 'dot', dmg: 5, speed: 3, count: 3, su: 14, rec: 24, pw: 6, ph: 6,
          def: 'When the variance of a model\'s errors is not constant across observations.', fx: 'Three results with wildly non-constant variance.' })
      ]
    },
    ftx: {
      id: 'ftx', name: 'FTX', full: 'FTX Trading Ltd.', mascot: 'The Token', hq: 'Nassau, The Bahamas', fell: '2022',
      tagline: 'FUNDS ARE SAFE.',
      bio: 'A crypto exchange valued at $32 billion whose customer deposits were quietly funnelled to its sister trading firm, Alameda Research. A run on its own token exposed an $8 billion hole. It filed for Chapter 11 on November 11, 2022, and its founder was convicted of fraud in 2023.',
      mascotBio: 'A coin-faced kid in a hoodie and cargo shorts, backed entirely by more of himself.',
      stage: 'beach', head: 'coin', speed: 1.9, bw: 11, th: 4, shorts: true,
      pal: { skin: '#f0c8a0', suit: '#1e9a9a', dark: '#126a6a', pants: '#8a8a78', shoe: '#eee', hair: '#126a6a', front: '#1e9a9a', accent: '#f6c83a' },
      specials: [
        S({ name: 'LIQUIDITY', cmd: '236P', type: 'proj', kind: 'wave', dmg: 9, speed: 2.8, low: true, h: 'low', ground: true, pw: 18, ph: 14,
          def: 'How easily an asset can be turned into cash. You find out how much you have when everyone asks at once.', fx: 'Low wave along the floor. Must be blocked crouching.' }),
        S({ name: 'RUG PULL', cmd: '214K', type: 'dash', dmg: 9, speed: 4.4, act: 13, low: true, h: 'low', kd: true, pose: 'slide',
          def: 'When a crypto project\'s backers drain the funds and disappear.', fx: 'Sliding low kick. Knocks down.' }),
        S({ name: 'COMMINGLED FUNDS', cmd: '22P', type: 'grab', effect: 'drain', dmg: 10, heal: 10, range: 36, su: 9, rec: 26,
          def: 'Mixing customers\' money with the firm\'s own.', fx: 'Unblockable grab. Their health becomes your health.' })
      ]
    },
    madoff: {
      id: 'madoff', name: 'MADOFF', full: 'Bernard L. Madoff Investment Securities', mascot: 'The Pyramid', hq: 'New York, New York', fell: '2008',
      tagline: 'STEADY RETURNS. EVERY SINGLE MONTH.',
      bio: 'The largest Ponzi scheme in history. For decades the firm\'s advisory business reported smooth, impossible returns while paying old investors with new investors\' money. It collapsed in December 2008 with about $65 billion in fictitious account balances, despite years of ignored warnings to the SEC.',
      mascotBio: 'A pyramid with an eye and a very nice suit. Always needs one more investor below it.',
      stage: 'penthouse', head: 'pyramid', speed: 1.6, bw: 12, th: 4,
      pal: { skin: '#f0c8a8', suit: '#20242e', dark: '#10121a', pants: '#20242e', shoe: '#111', hair: '#d8a820', front: '#e8e8f0', accent: '#d8a820' },
      specials: [
        S({ name: 'PONZI SCHEME', cmd: '236P', type: 'proj', kind: 'pyramid', dmg: 6, speed: 2.2, grow: true,
          def: 'A fraud that pays earlier investors with money from later ones.', fx: 'Slow pyramid that grows, and hits harder, the longer it survives.' }),
        S({ name: 'CAPITAL GAIN', cmd: '214K', type: 'rise', dmg: 12, su: 5, rec: 14,
          def: 'The profit from selling an asset for more than you paid.', fx: 'Rising strike. Up only.' }),
        S({ name: 'GOLDEN HANDCUFFS', cmd: '22P', type: 'grab', effect: 'stun', dmg: 4, stun: 70, range: 36, su: 9, rec: 14,
          def: 'Pay and perks structured so an employee cannot afford to leave.', fx: 'Unblockable grab. Locks the opponent in place.' })
      ]
    },
    wamu: {
      id: 'wamu', name: 'WAMU', full: 'Washington Mutual', mascot: 'The Teller', hq: 'Seattle, Washington', fell: '2008',
      tagline: 'THE POWER OF YES.',
      bio: 'The largest savings and loan in the U.S., which loaded up on subprime and option adjustable-rate mortgages. After depositors pulled $16.7 billion in ten days, regulators seized it on September 25, 2008, the biggest bank failure in American history, and sold it to JPMorgan Chase for $1.9 billion.',
      mascotBio: 'A cheerful house-headed loan officer who has never once said no.',
      stage: 'vault', head: 'house', speed: 1.6, bw: 12, th: 5,
      pal: { skin: '#f0d0b0', suit: '#2a5ab0', dark: '#1a3a78', pants: '#283858', shoe: '#222', hair: '#b83228', front: '#f6d83a', accent: '#f6d83a' },
      specials: [
        S({ name: '10-K', cmd: '236P', type: 'proj', kind: 'doc', label: '10-K', dmg: 11, speed: 2.4, su: 15, pw: 26, ph: 14,
          def: 'The comprehensive annual report every U.S. public company must file with the SEC.', fx: 'Slow, heavy annual filing.' }),
        S({ name: 'BANK RUN', cmd: '214K', type: 'dash', dmg: 4, speed: 4, act: 17, multi: true,
          def: 'When depositors all rush to withdraw at once, fearing the bank will fail.', fx: 'Stampede that hits several times.' }),
        S({ name: 'INFLATION', cmd: '22P', type: 'inflate', dmg: 9, su: 11, act: 5, rec: 22,
          def: 'A general rise in prices over time, eroding what money can buy.', fx: 'Inflates the opponent, who floats helplessly upward.' })
      ]
    },
    regulator: {
      id: 'regulator', name: 'THE REGULATOR', full: 'The Regulator', mascot: 'Final Boss', hq: 'Washington, D.C.', fell: 'NEVER', boss: true,
      tagline: 'WE HAVE SOME QUESTIONS.',
      bio: 'Arrives after everything has already collapsed.', mascotBio: 'Fedora. Trench coat. Subpoena.',
      stage: 'hearing', head: 'fedora', speed: 1.8, bw: 13, th: 5,
      pal: { skin: '#e8c0a0', suit: '#8a7450', dark: '#5a4a30', pants: '#2a2a30', shoe: '#111', hair: '#3a3020', front: '#f0f0f0', accent: '#3a6ad8' },
      specials: [
        S({ name: 'SUBPOENA', cmd: '236P', type: 'proj', kind: 'doc', label: 'SEC', dmg: 10, speed: 3.4, pw: 22, ph: 14,
          def: 'A legal order compelling testimony or documents.', fx: 'Fast legal paperwork.' }),
        S({ name: 'CEASE AND DESIST', cmd: '214K', type: 'dash', dmg: 12, speed: 4.8, act: 13, kd: true,
          def: 'An order to stop an activity immediately.', fx: 'Charging tackle.' }),
        S({ name: 'CONSENT DECREE', cmd: '22P', type: 'grab', effect: 'stun', dmg: 6, stun: 60, range: 38, su: 9, rec: 14,
          def: 'A settlement in which a company agrees to change its behaviour without admitting guilt.', fx: 'Unblockable grab. Stuns.' })
      ]
    }
  };

  BF.ROSTER = ['enron', 'worldcom', 'bear', 'lehman', 'theranos', 'ftx', 'madoff', 'wamu'];

  // Finishers. seq: d/u/f/b relative to facing, then btn.
  BF.FATALITIES = [
    { id: 'sox', name: 'SARBANES-OXLEY ACT', year: 2002, seq: ['f', 'd', 'f'], btn: 'p', input: '→ ↓ → + P', dur: 330, verb: 'LEGISLALITY',
      point: 'Whistleblower protection and independent audits',
      law: 'Passed after Enron and WorldCom. It created the PCAOB to police auditors, made CEOs and CFOs personally certify their financial statements, required audits of internal controls, protected whistleblowers from retaliation, and made destroying audit documents a crime.',
      finisher: 'A colossal whistle descends and blows. A swarm of independent auditors floods in from both sides and buries the loser under paperwork until the books are RESTATED.' },
    { id: 'glass', name: 'GLASS-STEAGALL ACT', year: 1933, seq: ['b', 'f', 'b'], btn: 'k', input: '← → ← + K', dur: 280, verb: 'LEGISLALITY',
      point: 'Separating commercial banking from investment banking',
      law: 'The Banking Act of 1933, passed after the crash of 1929. It walled off deposit-taking commercial banks from securities-dealing investment banks and created the FDIC. Its separation provisions were repealed in 1999 by Gramm-Leach-Bliley.',
      finisher: 'A sheet of glass slams down through the loser, cleaving them into a COMMERCIAL half and an INVESTMENT half, which hop away from each other.' },
    { id: 'dodd', name: 'DODD-FRANK ACT', year: 2010, seq: ['d', 'd', 'u'], btn: 'p', input: '↓ ↓ ↑ + P', dur: 300, verb: 'LEGISLALITY',
      point: 'Stress tests and orderly liquidation of failing giants',
      law: 'The response to the 2008 crisis. It introduced annual stress tests for big banks, the Orderly Liquidation Authority for winding down failing firms, the Volcker Rule against proprietary trading, the Consumer Financial Protection Bureau, and central clearing for derivatives.',
      finisher: 'A hydraulic STRESS TEST press flattens the loser, who fails it, and then undergoes ORDERLY LIQUIDATION into a neat green puddle.' },
    { id: 'sherman', name: 'SHERMAN ANTITRUST ACT', year: 1890, seq: ['f', 'f', 'd'], btn: 'k', input: '→ → ↓ + K', dur: 280, verb: 'LEGISLALITY',
      point: 'Breaking up monopolies',
      law: 'The first U.S. federal antitrust law. It outlaws monopolization and conspiracies in restraint of trade, and was the basis for breaking up Standard Oil in 1911 and the Bell System in 1984.',
      finisher: 'A giant gavel comes down and the loser is BROKEN UP into seven tiny competing versions of itself, which scatter.' },
    { id: 'eesa', name: 'EMERGENCY ECONOMIC STABILIZATION ACT', short: 'E.E.S.A.', year: 2008, seq: ['u', 'u', 'd'], btn: 'b', input: '↑ ↑ ↓ + BLOCK', dur: 300, verb: 'BAILOUT', mercy: true,
      point: 'The $700 billion bailout (TARP)',
      law: 'Passed in October 2008 at the height of the crisis. It created the Troubled Asset Relief Program, authorizing $700 billion to buy toxic assets and inject capital into banks deemed too big to fail.',
      finisher: 'The merciful one. A helicopter drops a $700B money bag and the loser springs back to life, celebrating. The winner cannot believe it.' }
  ];
})();
