import { Input, InputWrapper } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "@/components/keenicons/icons";

export function HeaderSearch() {
  const handleInputChange = () => {};

  return (
    <div className="flex shrink-0 lg:w-65 p-2.5 lg:p-0">
      <InputWrapper>
        <Search />
        <Input type="search" placeholder="Search" onChange={handleInputChange} />
        <Badge variant="outline" className="whitespace-nowrap" size="sm">⌘ K</Badge>
      </InputWrapper>
    </div>
  );
}
