import { Card, MD3Colors, Text } from "react-native-paper";
import { forwardRef } from "react";

interface Props {
	label: string;
}

const LabelHeader = ({ label }: Props) => {
	return (
		<Card
			mode="contained"
			style={{
				backgroundColor: "none",
			}}
		>
			<Card.Content>
				<Text
					style={{
						color: MD3Colors.primary70,
					}}
				>
					{label}
				</Text>
			</Card.Content>
		</Card>
	);
};

export default LabelHeader;
