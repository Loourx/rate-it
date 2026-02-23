const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;
const WEEK = 604_800_000;
const MONTH = 2_592_000_000; // ~30 days

/**
 * Converts an ISO date string into a human-readable relative time in Spanish.
 * No external dependencies — pure Date math.
 */
export function formatRelativeDate(dateString: string): string {
    const diff = Date.now() - new Date(dateString).getTime();

    if (diff < 0) return 'ahora';

    if (diff < MINUTE) return 'hace un momento';
    if (diff < HOUR) {
        const mins = Math.floor(diff / MINUTE);
        return `hace ${mins} min`;
    }
    if (diff < DAY) {
        const hours = Math.floor(diff / HOUR);
        return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }
    if (diff < WEEK) {
        const days = Math.floor(diff / DAY);
        return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
    }
    if (diff < MONTH) {
        const weeks = Math.floor(diff / WEEK);
        return `hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
    }

    const months = Math.floor(diff / MONTH);
    return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
}
