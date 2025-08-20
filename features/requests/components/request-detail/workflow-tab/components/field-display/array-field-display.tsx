interface ArrayFieldDisplayProps {
  fieldValue: string[];
}

export const ArrayFieldDisplay = ({ fieldValue }: ArrayFieldDisplayProps) => {
  const filteredValue = fieldValue.filter(Boolean);

  if (filteredValue.length === 0) {
    return <span className="text-gray-500 italic">Chưa có dữ liệu</span>;
  }

  return (
    <ul className="space-y-1">
      {filteredValue.map((item: string, index: number) => (
        <li key={index} className="text-sm">
          • {item}
        </li>
      ))}
    </ul>
  );
};
