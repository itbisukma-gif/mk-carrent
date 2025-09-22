import type { ComboboxItem } from "@/components/ui/combobox";
import logos from './logo-urls.json';

export const bankList: ComboboxItem[] = [
    { value: 'bca', label: 'BCA', logo: logos.BCA },
    { value: 'mandiri', label: 'Mandiri', logo: logos.Mandiri },
    { value: 'bni', label: 'BNI', logo: logos.BNI },
    { value: 'bri', label: 'BRI', logo: logos.BRI },
    { value: 'cimb', label: 'CIMB Niaga', logo: 'https://raw.githubusercontent.com/Adekabang/indonesia-logo-library/main/Bank/Bank%20Logo/CIMB%20Niaga.png' },
    { value: 'danamon', label: 'Danamon', logo: 'https://raw.githubusercontent.com/Adekabang/indonesia-logo-library/main/Bank/Bank%20Logo/Danamon.png' },
];
