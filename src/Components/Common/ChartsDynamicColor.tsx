const getChartColorsArray = (colors: string): string[] => {
	const parsedColors: string[] = JSON.parse(colors);
	return parsedColors.map((value: string) => {
		const newValue = value.replace(" ", "");
		if (newValue.indexOf(",") === -1) {
			const color = getComputedStyle(document.documentElement).getPropertyValue(
				newValue,
			);

			if (color.indexOf("#") !== -1) {
				return color.replace(" ", "");
			}
			if (color) return color;
			return newValue;
		}
		const val = value.split(",");
		if (val.length === 2) {
			const rgbaColor = getComputedStyle(
				document.documentElement,
			).getPropertyValue(val[0]);
			return `rgba(${rgbaColor},${val[1]})`;
		}
		return newValue;
	});
};

export default getChartColorsArray;
