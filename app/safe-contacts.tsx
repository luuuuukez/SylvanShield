import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { ScreenHeader } from "../src/components/ScreenHeader";
import { IconExternalLink, IconPlus } from "../src/components/icons";
import { supabase } from "../src/lib/supabase";

type Contact = {
  id: string;
  name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
};

const FALLBACK_AVATAR = "https://placehold.co/60x60";

/** Dark primary-contact card */
function PrimaryContactCard({
  contact,
  onPress,
  onLongPress,
}: {
  contact: Contact;
  onPress: () => void;
  onLongPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      className="rounded-inner-card bg-status-button overflow-hidden"
      style={{ height: 80 }}
    >
      <View className="flex-row items-center flex-1 px-4" style={{ height: 80 }}>
        <Image
          source={{ uri: contact.avatar_url ?? FALLBACK_AVATAR }}
          style={{ width: 52, height: 52, borderRadius: 26 }}
          resizeMode="cover"
        />
        <View className="flex-1 ml-4 gap-1">
          <Text className="text-white text-base leading-5">{contact.name ?? "—"}</Text>
          <Text className="text-secondary text-xs leading-4">{contact.phone ?? "—"}</Text>
        </View>
        <IconExternalLink color="#B0B3BA" />
      </View>
    </TouchableOpacity>
  );
}

/** Light secondary-contact card */
function SecondaryContactCard({
  contact,
  onPress,
  onLongPress,
}: {
  contact: Contact;
  onPress: () => void;
  onLongPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      className="rounded-inner-card bg-background-card overflow-hidden"
      style={{ height: 80 }}
    >
      <View className="flex-row items-center flex-1 px-4" style={{ height: 80 }}>
        <Image
          source={{ uri: contact.avatar_url ?? FALLBACK_AVATAR }}
          style={{ width: 52, height: 52, borderRadius: 26 }}
          resizeMode="cover"
        />
        <View className="flex-1 ml-4 gap-1">
          <Text className="text-primary text-base leading-5">{contact.name ?? "—"}</Text>
          <Text className="text-secondary text-xs leading-4">{contact.phone ?? "—"}</Text>
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
      className="rounded-inner-card bg-background-card items-center justify-center"
      style={{ height: 80 }}
    >
      <IconPlus />
      <Text className="text-secondary text-xs leading-4 mt-1">Lisää turvakontakti</Text>
    </TouchableOpacity>
  );
}

export default function SafeContactsScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function fetchContacts() {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const { data } = await supabase
          .from("safety_contacts")
          .select("id, name, phone, avatar_url, is_active")
          .eq("user_id", user.id)
          .order("is_active", { ascending: false });

        if (data) setContacts(data);
        setLoading(false);
      }
      fetchContacts();
    }, [])
  );

  function editContact(contact: Contact) {
    router.push(`/safe-contact-edit?id=${contact.id}`);
  }

  function confirmDelete(contact: Contact) {
    Alert.alert(
      "Poista turvakontakti",
      `Haluatko varmasti poistaa kontaktin "${contact.name ?? "—"}"?`,
      [
        { text: "Peruuta", style: "cancel" },
        {
          text: "Poista",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("safety_contacts")
              .delete()
              .eq("id", contact.id);

            if (error) {
              Alert.alert("Virhe", "Poistaminen epäonnistui. Yritä uudelleen.");
            } else {
              setContacts((prev) => prev.filter((c) => c.id !== contact.id));
            }
          },
        },
      ]
    );
  }

  const primaryContact = contacts.find((c) => c.is_active);
  const otherContacts = contacts.filter((c) => !c.is_active);

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
      <ScreenHeader title="Turvakontaktit" onClose={() => router.back()} />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#B0B3BA" />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Primary contact */}
          {primaryContact ? (
            <>
              <Text className="text-xs text-secondary leading-4 mb-2">Nykyinen Turvakontakti</Text>
              <PrimaryContactCard
                contact={primaryContact}
                onPress={() => editContact(primaryContact)}
                onLongPress={() => confirmDelete(primaryContact)}
              />
            </>
          ) : (
            <>
              <Text className="text-xs text-secondary leading-4 mb-2">Nykyinen Turvakontakti</Text>
              <View
                className="rounded-inner-card bg-background-card items-center justify-center"
                style={{ height: 80 }}
              >
                <Text className="text-secondary text-xs">Ei aktiivista turvakontaktia</Text>
              </View>
            </>
          )}

          {/* Contact list */}
          <Text className="text-xs text-secondary leading-4 mt-6 mb-2">Turvakontaktien lista</Text>
          <View className="gap-4">
            {otherContacts.map((c) => (
              <SecondaryContactCard
                key={c.id}
                contact={c}
                onPress={() => editContact(c)}
                onLongPress={() => confirmDelete(c)}
              />
            ))}
            <AddContactCard onPress={() => router.push("/safe-contact-edit")} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
