import Button from "@/components/primitives/Button";
import Input from "@/components/primitives/Input";
import Picker from "@/components/primitives/Picker";
import SearchInput from "@/components/primitives/SearchInput";
import Toggle from "@/components/primitives/Toggle";
import theme from '@/theme/theme';
import { ButtonType, InputType, ToggleType } from '@/theme/types';
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import TicketStubCard from "@/components/tickets/TicketStubCard";

export default function Index() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [studentId, setStudentId] = useState("");
  const [search, setSearch] = useState("");
  const [program, setProgram] = useState(null);
  const [guestType, setGuestType] = useState(null);

  return (
    <TicketStubCard
        ticket={{
          shortNumber: 'R-006',
          nowServing: 'R-002',
          officeName: 'University Registrar',
          location: 'Main Bldg, 3rd Flr',
          status: 'yourTurn',
        }}
        onOpenScanner={() => console.log('open scanner')}
      />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.paper,
  },
  content: {
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});