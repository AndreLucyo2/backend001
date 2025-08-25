/**
 * Formatar telefone
 */
export function formatPhone(phone: string): string {
	const numbers = phone.replace(/\D/g, '');
	if (numbers.length === 11) {
		return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
	}
	if (numbers.length === 10) {
		return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
	}
	return phone;
}

/**
 * Formatar CPF
 */
export function formatCPF(cpf: string): string {
	const numbers = cpf.replace(/\D/g, '');
	if (numbers.length === 11) {
		return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
	}
	return cpf;
}

/**
 * Formatar CNPJ
 */
export function formatCNPJ(cnpj: string): string {
	const numbers = cnpj.replace(/\D/g, '');
	if (numbers.length === 14) {
		return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12)}`;
	}
	return cnpj;
}

/**
 * Validação real de CPF
 */
export function validateCPF(cpf: string): boolean {
	const numbers = cpf.replace(/\D/g, '');
	if (numbers.length !== 11 || /^(\d)\1+$/.test(numbers)) return false;
	let sum = 0, rest;
	for (let i = 1; i <= 9; i++) sum += parseInt(numbers.substring(i - 1, i)) * (11 - i);
	rest = (sum * 10) % 11;
	if (rest === 10 || rest === 11) rest = 0;
	if (rest !== parseInt(numbers.substring(9, 10))) return false;
	sum = 0;
	for (let i = 1; i <= 10; i++) sum += parseInt(numbers.substring(i - 1, i)) * (12 - i);
	rest = (sum * 10) % 11;
	if (rest === 10 || rest === 11) rest = 0;
	return rest === parseInt(numbers.substring(10, 11));
}

/**
 * Validação real de CNPJ
 */
export function validateCNPJ(cnpj: string): boolean {
	const numbers = cnpj.replace(/\D/g, '');
	if (numbers.length !== 14 || /^(\d)\1+$/.test(numbers)) return false;
	let length = numbers.length - 2;
	let numbersBase = numbers.substring(0, length);
	let digits = numbers.substring(length);
	let sum = 0;
	let pos = length - 7;
	for (let i = length; i >= 1; i--) {
		sum += parseInt(numbersBase.charAt(length - i)) * pos--;
		if (pos < 2) pos = 9;
	}
	let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
	if (result !== parseInt(digits.charAt(0))) return false;
	length = length + 1;
	numbersBase = numbers.substring(0, length);
	sum = 0;
	pos = length - 7;
	for (let i = length; i >= 1; i--) {
		sum += parseInt(numbersBase.charAt(length - i)) * pos--;
		if (pos < 2) pos = 9;
	}
	result = sum % 11 < 2 ? 0 : 11 - sum % 11;
	return result === parseInt(digits.charAt(1));
}