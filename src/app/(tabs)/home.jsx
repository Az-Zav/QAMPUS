import Badge from '@/components/shell/Badge';
import Header from '@/components/shell/Header';
import ModalShell from '@/components/shell/ModalShell';
import { useState } from 'react';
import { Text } from 'react-native';

export default function Home() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Header title="HOME" hasNotification onBellPress={() => {}} onAvatarPress={() => {}} />

      <Badge status="waiting" />
      <Badge status="yourTurn" />
      <Badge status="expired" />
      <Badge status="inService" />
      <Badge status="completed" />
      <Badge status="cancelled" />
      <Badge status="noShow" />

      <ModalShell visible={modalVisible} onClose={() => setModalVisible(false)}>
        <Text>Modal test content</Text>
      </ModalShell>
    </>
  );
}