import React from "react";
import { Image, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Path, G } from "react-native-svg";
import { ScreenHeader } from "../src/components/ScreenHeader";

/** External link / edit icon (16×16) */
function IconExternalLink({ color = "#B0B3BA" }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path
        d="M14.0001 8.66667V13C14.0001 13.5523 13.5524 14 13.0001 14C9.66677 14 6.33347 14 3.00018 14C2.44783 14 2.00009 13.5522 2.00017 12.9998C2.00065 9.66663 2.00078 6.33343 2.0002 3.00022C2.0001 2.44785 2.44785 2 3.00022 2H7.3334"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M13.7656 2.66699L5.76563 10.667"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Plus icon (36×36) for the add-contact card */
function IconPlus() {
  return (
    <Svg width={36} height={36} viewBox="0 0 36 36" fill="none">
      <G opacity={0.6}>
        <Path
          d="M9 18H27"
          stroke="#B0B3BA"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M18 9V27"
          stroke="#B0B3BA"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}

type Contact = {
  id: string;
  name: string;
  phone: string;
  avatar: string;
};

const PRIMARY_CONTACT: Contact = {
  id: "primary",
  name: "Anna Svensson",
  phone: "+358 451264429",
  avatar: "https://placehold.co/60x60",
};

const OTHER_CONTACTS: Contact[] = [
  {
    id: "1",
    name: "Henrietta Hassinen",
    phone: "+358 452224140",
    avatar: "https://placehold.co/60x60",
  },
];

/** Dark primary-contact card */
function PrimaryContactCard({ contact, onPress }: { contact: Contact; onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="rounded-2xl bg-status-button overflow-hidden"
      style={{ height: 80 }}
    >
      <View className="flex-row items-center flex-1 px-4" style={{ height: 80 }}>
        <Image
          source={{ uri: contact.avatar }}
          style={{ width: 52, height: 52, borderRadius: 26 }}
          resizeMode="cover"
        />
        <View className="flex-1 ml-4 gap-1">
          <Text className="text-white text-base leading-5">{contact.name}</Text>
          <Text className="text-caption text-xs leading-4">{contact.phone}</Text>
        </View>
        <IconExternalLink color="#B0B3BA" />
      </View>
    </TouchableOpacity>
  );
}

/** Light secondary-contact card */
function SecondaryContactCard({ contact, onPress }: { contact: Contact; onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="rounded-2xl bg-history-card overflow-hidden"
      style={{ height: 80 }}
    >
      <View className="flex-row items-center flex-1 px-4" style={{ height: 80 }}>
        <Image
          source={{ uri: contact.avatar }}
          style={{ width: 52, height: 52, borderRadius: 26 }}
          resizeMode="cover"
        />
        <View className="flex-1 ml-4 gap-1">
          <Text className="text-primary text-base leading-5">{contact.name}</Text>
          <Text className="text-caption text-xs leading-4">{contact.phone}</Text>
        </View>
        <IconExternalLink color="#B0B3BA" />
      </View>
    </TouchableOpacity>
  );
}

/** Add-contact card */
function AddContactCard({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="rounded-2xl bg-history-card items-center justify-center"
      style={{ height: 80 }}
    >
      <IconPlus />
      <Text className="text-caption text-xs leading-4 mt-1">Lisää turvakontakti</Text>
    </TouchableOpacity>
  );
}

export default function SafeContactsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
      {/* Header */}
      <ScreenHeader title="Turvakontaktit" onClose={() => router.back()} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Primary contact */}
        <Text className="text-xs text-caption leading-4 mb-2">Nykyinen Turvakontakti</Text>
        <PrimaryContactCard
          contact={PRIMARY_CONTACT}
          onPress={() =>
            router.push(`/safe-contact-edit?name=${encodeURIComponent(PRIMARY_CONTACT.name)}&phone=${encodeURIComponent(PRIMARY_CONTACT.phone)}`)
          }
        />

        {/* Contact list */}
        <Text className="text-xs text-caption leading-4 mt-6 mb-2">Turvakontaktien lista</Text>
        <View className="gap-4">
          {OTHER_CONTACTS.map((c) => (
            <SecondaryContactCard
              key={c.id}
              contact={c}
              onPress={() =>
                router.push(`/safe-contact-edit?name=${encodeURIComponent(c.name)}&phone=${encodeURIComponent(c.phone)}`)
              }
            />
          ))}
          <AddContactCard
            onPress={() => router.push("/safe-contact-edit")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
