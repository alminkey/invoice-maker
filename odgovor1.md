Evo najbržeg načina da stanje spremiš na GitHub. Pokazaću dva slučaja: kreiranje novog repo-a i push u već postojeći.

Kreiranje NOVOG repo-a na GitHub
- Inicijalizuj Git i napravi inicijalni commit:
  - git init
  - git add .
  - git commit -m "Initial commit: invoice-maker with deposit, i18n, PDF, UI fixes"
- Kreiraj repo na GitHubu:
  - Varijanta A — GitHub web:
    - Otvori github.com, kreiraj novi repo (bez README).
    - Kopiraj HTTPS URL, npr. https://github.com/korisnik/invoice-maker.git
  - Varijanta B — GitHub CLI (ako imaš gh instaliran i ulogovan):
    - gh repo create korisnik/invoice-maker --private --source . --remote origin --push
- Poveži i push-aj (ako radiš Varijantu A):
  - git branch -M main
  - git remote add origin https://github.com/korisnik/invoice-maker.git
  - git push -u origin main

Push u POSTOJEĆI repo na GitHubu
- Dodaj remote i push-aj:
  - git init
  - git add .
  - git commit -m "Project update"
  - git branch -M main
  - git remote add origin https://github.com/korisnik/postojeci-repo.git
  - git push -u origin main

Napomene
- Autentikacija: Kada te git zatraži korisnika/lozinku, koristi GitHub Personal Access Token (PAT) umjesto lozinke. Kreira se na: https://github.com/settings/tokens (klasični token) ili koristi GitHub CLI: gh auth login.
- SSH alternativa:
  - Generiši ključ: ssh-keygen -t ed25519 -C "tvoj-email"
  - Dodaj javni ključ na GitHub (Settings → SSH and GPG keys), pa koristi SSH URL: git@github.com:korisnik/invoice-maker.git
- Provjera:
  - git remote -v
  - git log --oneline -n 3

Želiš li da odmah inicijalizujem git ovdje i spremim prvi commit, pa te zamolim da zalijepiš GitHub URL za remote?

