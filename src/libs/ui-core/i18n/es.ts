import { type UiTexts } from './en.ts';

/** The texts of the kit in Spanish. */
export const UI_TEXTS_ES: UiTexts = {
	dataGrid: {
		no: 'No',
		yes: 'Sí',
	},
	alert: {
		close: 'Cerrar mensaje',
		errorTitle: 'No se pudo completar la acción',
		support: 'Código de soporte',
	},
	alertDialog: {
		cancel: 'Cancelar',
		close: 'Entendido',
		confirm: 'Confirmar',
		requireText: (text: string) => `Escriba «${text}» para confirmar`,
	},
	amountMessages: {
		max: (limit: string) => `El monto máximo es ${limit}`,
		min: (limit: string) => `El monto mínimo es ${limit}`,
	},
	appShell: {
		closeMenu: 'Cerrar el menú',
		fold: 'Plegar el menú',
		home: 'Inicio',
		menu: 'Menú',
		navigation: 'Menú principal',
		sidebar: 'Barra lateral',
		skip: 'Saltar al contenido',
		unfold: 'Desplegar el menú',
	},
	breadcrumb: {
		label: 'Ruta',
	},
	calendar: {
		month: 'Mes',
		next: 'Mes siguiente',
		previous: 'Mes anterior',
		year: 'Año',
	},
	chip: {
		remove: 'Quitar',
		removeItem: (name: string) => `Quitar ${name}`,
	},
	choiceDialog: {
		cancel: 'Cancelar',
	},
	combobox: {
		empty: 'Sin resultados',
		error: 'No se pudo buscar. Intente de nuevo.',
		list: 'Resultados',
		searching: 'Buscando…',
		unpicked: 'Elija una opción de la lista',
	},
	dataTable: {
		attention: 'Requiere gestión',
		sortBy: 'Ordenar por',
	},
	dateMessages: {
		invalid: 'Fecha no válida: use {format}, por ejemplo {example}',
		max: 'La fecha no puede ser posterior al {date}',
		min: 'La fecha no puede ser anterior al {date}',
		required: 'Escriba la fecha ({format}) o elíjala en el calendario',
	},
	datePicker: {
		clear: 'Limpiar',
		day: 'dd',
		dialog: 'Elegir fecha',
		format: 'Formato: {format}, por ejemplo {example}',
		month: 'mm',
		open: 'Abrir calendario',
		today: 'Hoy',
		year: 'aaaa',
	},
	dialog: {
		cancel: 'Cancelar',
		close: 'Cerrar',
		submit: 'Guardar',
	},
	drawer: {
		close: 'Cerrar panel',
	},
	fileMessages: {
		required: 'Elija un archivo',
		single: 'Suelte un solo archivo',
		type: 'El archivo debe ser {accept}',
	},
	fileUpload: {
		change: 'Cambiar archivo',
		choose: 'Elegir archivo',
		remove: 'Quitar archivo',
	},
	filterChips: {
		all: 'Todos',
	},
	kpiRow: {
		link: 'Ver detalle',
	},
	label: {
		optional: '(opcional)',
	},
	multiSelect: {
		clear: 'Limpiar',
		empty: 'Sin resultados',
		list: 'Opciones',
		placeholder: 'Seleccione…',
		search: 'Buscar',
		selected: (count: number, formatted: string) =>
			`${formatted} ${count === 1 ? 'seleccionada' : 'seleccionadas'}`,
	},
	pager: {
		go: 'Ir',
		jump: 'Ir a página',
		noun: ['resultado', 'resultados'],
		sizes: 'Filas por página',
		outOfRange: (pages: string) => `Entre 1 y ${pages}`,
		pageOf: (page: string, pages: string) => `página ${page} de ${pages}`,
		range: (from: string, to: string, counted: string) =>
			`Mostrando ${from}–${to} de ${counted}`,
	},
	pagination: {
		first: 'Primera página',
		last: 'Última página',
		navigation: 'Paginación',
		next: 'Página siguiente',
		previous: 'Página anterior',
		page: (page: number) => `Página ${page}`,
		position: (page: number, pages: number) => `Página ${page} de ${pages}`,
	},
	promptDialog: {
		cancel: 'Cancelar',
		confirm: 'Aceptar',
		required: 'Escriba un texto para continuar',
	},
	rutMessages: {
		invalid: 'RUT no válido',
		incomplete: 'Escriba el RUT completo, con su dígito verificador',
		text: 'RUT no válido',
	},
	searchSelect: {
		clear: 'Quitar selección',
		empty: 'Sin resultados',
		list: 'Opciones',
		placeholder: 'Seleccione…',
		search: 'Buscar',
	},
	settings: {
		accessibility: 'Accesibilidad',
		animations: 'Animaciones',
		appearance: 'Apariencia',
		appearanceHint: 'Cómo se ve la aplicación en este navegador.',
		auto: 'Automático',
		autoHint: 'Sigue al sistema',
		close: 'Cerrar la configuración',
		contrast: 'Contraste',
		contrastMore: 'Alto',
		contrastNormal: 'Normal',
		dark: 'Oscuro',
		done: 'Listo',
		language: 'Idioma',
		languageHint: 'El idioma de los textos, las fechas y los números.',
		large: 'Grande',
		light: 'Claro',
		motion: 'Movimiento',
		motionFull: 'Completas',
		motionReduce: 'Reducidas',
		normal: 'Normal',
		pureBlack: 'Negro puro',
		reading: 'Lectura',
		sections: 'Secciones de la configuración',
		systemContrast: 'Su sistema pide más contraste.',
		systemMotion: 'Su sistema pide menos movimiento.',
		text: 'Texto',
		textSize: 'Tamaño del texto',
		textSizeHint: 'Grande agranda el texto de toda la aplicación.',
		theme: 'Tema',
		title: 'Configuración',
		underlineLinks: 'Subrayar enlaces',
		accessibilityHint:
			'Ajustes para leer y usar la aplicación con más comodidad.',
		animationsHint:
			'Reducidas: nada se desplaza ni aparece de a poco; lo que carga se sigue viendo.',
		contrastHint:
			'Alto: texto más oscuro, bordes más marcados y el foco del teclado más visible.',
		pureBlackHint:
			'En el tema oscuro, un fondo negro de verdad: para pantallas OLED.',
		underlineLinksHint:
			'Los enlaces se distinguen por algo más que su color.',
	},
	spinner: {
		label: 'Cargando',
	},
	stepper: {
		disabled: 'No disponible',
		done: 'Completado',
		error: 'Con error',
	},
	stepperSummary: {
		position: (current: number, total: number) =>
			`Paso ${current} de ${total}`,
	},
	tabs: {
		attention: 'requiere atención',
	},
	timeline: {
		current: 'En curso',
		done: 'Completado',
		pending: 'Pendiente',
	},
	timeMessages: {
		invalid: 'Hora no válida: use hh:mm en 24 horas, por ejemplo 09:30',
		max: 'La hora no puede ser posterior a las {time}',
		min: 'La hora no puede ser anterior a las {time}',
		required: 'Escriba la hora (hh:mm) o elíjala en el panel',
	},
	timePicker: {
		clear: 'Limpiar',
		dialog: 'Elegir hora',
		format: 'Formato: hora y minutos en 24 horas, por ejemplo 09:30',
		hours: 'Horas',
		minutes: 'Minutos',
		now: 'Ahora',
		open: 'Abrir selector de hora',
		times: 'Horarios',
	},
	toaster: {
		close: 'Cerrar aviso',
		label: 'Avisos',
	},
	userMenu: {
		menuOf: (name: string) => `Menú de ${name}`,
	},
};
