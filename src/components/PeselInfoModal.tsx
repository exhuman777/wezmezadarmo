'use client';

interface PeselInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PeselInfoModal({ isOpen, onClose }: PeselInfoModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />

      {/* Modal */}
      <div
        className="relative w-full sm:max-w-lg max-h-[85vh] overflow-y-auto bg-bg-1 border border-border sm:rounded-2xl rounded-t-2xl"
        style={{ boxShadow: '0 -4px 40px rgba(0,0,0,0.2)', animation: 'sheetUp 0.3s ease' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex justify-between items-center px-5 py-4 border-b border-border bg-bg-1 sm:rounded-t-2xl">
          <h2 className="text-[17px] sm:text-[19px] font-bold text-text-1">
            Czy podanie PESEL jest bezpieczne?
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-3 hover:text-text-1 hover:bg-bg-2 cursor-pointer transition-colors text-[18px]"
          >
            x
          </button>
        </div>

        <div className="px-5 py-5 space-y-5 text-[14px] sm:text-[15px] leading-[1.7] text-text-2">

          {/* TL;DR */}
          <div className="p-3.5 rounded-xl" style={{ background: 'var(--color-green-bg)', border: '1px solid var(--color-green-border)' }}>
            <div className="text-[12px] font-bold tracking-wide text-green uppercase mb-1.5">Krótko</div>
            <p className="text-text-1 font-medium text-[14px] sm:text-[15px]">
              Twój PESEL nie opuszcza Twojej przeglądarki. Nie przesyłamy go na żaden serwer. Dekodujemy z niego tylko wiek i płeć, lokalnie, na Twoim urządzeniu.
            </p>
          </div>

          {/* Section 1 */}
          <div>
            <h3 className="text-[15px] sm:text-[16px] font-bold text-text-1 mb-2">
              PESEL to nie klucz do Twojej tożsamości
            </h3>
            <p>
              Strach przed podaniem numeru PESEL w internecie wynika z przekonania, że jest on uniwersalnym kluczem do naszej tożsamości. To nieprawda.
            </p>
            <p className="mt-2">
              Sam ciąg 11 cyfr to jedynie identyfikator, jak numer na liście. Bez dodatkowych dokumentów i systemów weryfikacji jest bezużyteczny.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h3 className="text-[15px] sm:text-[16px] font-bold text-text-1 mb-2">
              Dlaczego sam PESEL nie wystarczy do niczego?
            </h3>
            <div className="space-y-2.5">
              <div className="flex gap-2.5">
                <span className="text-accent font-bold shrink-0 mt-0.5">{'\u2192'}</span>
                <div>
                  <span className="font-semibold text-text-1">Nie weźmiesz kredytu samym PESEL-em.</span> Banki wymagają dowodu osobistego, weryfikacji biometrycznej lub Profilu Zaufanego. Sam numer PESEL jest bezużyteczny.
                </div>
              </div>
              <div className="flex gap-2.5">
                <span className="text-accent font-bold shrink-0 mt-0.5">{'\u2192'}</span>
                <div>
                  <span className="font-semibold text-text-1">Nie uzyskasz świadczenia samym PESEL-em.</span> Urzędy wymagają złożenia wniosku z dokumentami, podpisu elektronicznego lub wizyty osobistej.
                </div>
              </div>
              <div className="flex gap-2.5">
                <span className="text-accent font-bold shrink-0 mt-0.5">{'\u2192'}</span>
                <div>
                  <span className="font-semibold text-text-1">Nie potwierdzisz tożsamości samym PESEL-em.</span> Każdy system wymaga wieloskładnikowej weryfikacji: hasło, SMS, dokument lub biometria.
                </div>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <h3 className="text-[15px] sm:text-[16px] font-bold text-text-1 mb-2">
              Co naprawdę jest niebezpieczne?
            </h3>
            <p className="mb-2">
              Prawdziwe ryzyko to nie sam numer, ale udostępnianie dokumentów:
            </p>
            <div className="space-y-2">
              <div className="flex gap-2.5">
                <span className="text-red font-bold shrink-0">!</span>
                <span>Wysyłanie skanów dowodu osobistego (zawierają zdjęcie, serię, numer i wzór podpisu)</span>
              </div>
              <div className="flex gap-2.5">
                <span className="text-red font-bold shrink-0">!</span>
                <span>Udostępnianie haseł i kodów SMS</span>
              </div>
              <div className="flex gap-2.5">
                <span className="text-red font-bold shrink-0">!</span>
                <span>Klikanie w podejrzane linki z wiadomości SMS lub e-mail</span>
              </div>
            </div>
            <p className="mt-2">
              Sam numer PESEL bez tych elementów nie daje oszustowi żadnych możliwości.
            </p>
          </div>

          {/* Section 4: Zastrzeżenie PESEL */}
          <div className="p-3.5 rounded-xl" style={{ background: 'var(--color-amber-bg)', border: '1px solid var(--color-amber-border)' }}>
            <h3 className="text-[15px] sm:text-[16px] font-bold text-text-1 mb-2">
              Zastrzeż swój PESEL. Dodatkowa warstwa ochrony
            </h3>
            <p>
              Od 2024 roku każdy obywatel może zastrzec swój numer PESEL. Zastrzeżony PESEL blokuje możliwość użycia go do:
            </p>
            <div className="mt-2 space-y-1.5">
              <div className="flex gap-2">
                <span className="text-accent font-bold shrink-0">{'\u2192'}</span>
                <span>Zaciągania kredytów i pożyczek</span>
              </div>
              <div className="flex gap-2">
                <span className="text-accent font-bold shrink-0">{'\u2192'}</span>
                <span>Wydawania duplikatu karty SIM</span>
              </div>
              <div className="flex gap-2">
                <span className="text-accent font-bold shrink-0">{'\u2192'}</span>
                <span>Zawierania umów u operatorów telekomunikacyjnych</span>
              </div>
            </div>
            <p className="mt-3 font-semibold text-text-1">
              Jak to zrobić?
            </p>
            <p className="mt-1">
              Otwórz aplikację mObywatel na swoim telefonie, przejdź do sekcji "Zastrzeż PESEL" i aktywuj zastrzeżenie jednym kliknięciem. Możesz je cofnąć w dowolnym momencie, gdy potrzebujesz użyć PESEL-u do oficjalnych celów.
            </p>
            <p className="mt-2 text-[12px] sm:text-[13px] text-text-3">
              Zastrzeżenie jest bezpłatne i natychmiastowe. Więcej informacji: mobywatel.gov.pl
            </p>
          </div>

          {/* Section 5: How we handle your data */}
          <div>
            <h3 className="text-[15px] sm:text-[16px] font-bold text-text-1 mb-2">
              Jak my traktujemy Twój PESEL?
            </h3>
            <div className="space-y-2">
              <div className="flex gap-2.5">
                <span className="text-green font-bold shrink-0">{'\u2713'}</span>
                <span>PESEL jest przetwarzany wyłącznie w Twojej przeglądarce i nigdy nie trafia na nasz serwer</span>
              </div>
              <div className="flex gap-2.5">
                <span className="text-green font-bold shrink-0">{'\u2713'}</span>
                <span>Dekodujemy z niego tylko dwie informacje: wiek i płeć</span>
              </div>
              <div className="flex gap-2.5">
                <span className="text-green font-bold shrink-0">{'\u2713'}</span>
                <span>Po zamknięciu strony dane znikają. Nic nie jest zapisywane</span>
              </div>
              <div className="flex gap-2.5">
                <span className="text-green font-bold shrink-0">{'\u2713'}</span>
                <span>Nie mamy bazy danych użytkowników, nie ma czego wykraść</span>
              </div>
              <div className="flex gap-2.5">
                <span className="text-green font-bold shrink-0">{'\u2713'}</span>
                <span>Połączenie jest szyfrowane protokołem HTTPS (TLS)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-semibold text-[15px] cursor-pointer transition-all active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))',
              color: '#fff',
            }}
          >
            Rozumiem, chcę sprawdzić świadczenia
          </button>
        </div>
      </div>
    </div>
  );
}
