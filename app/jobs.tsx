import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { categoryOf, formatDate, providerNextStep } from '../src/data';
import { useApp } from '../src/store';
import { colors } from '../src/theme';
import { Button, EmptyState, Header, StatusBadge } from '../src/ui';

// Define the columns and their widths for the jobs table
const COLS = [
  { label: 'Job', width: 130 },
  { label: 'Status', width: 90 },
  { label: 'Date', width: 85 },
  { label: 'Action', width: 80 },
];

// Calculate the total width of all table columns
const TABLE_WIDTH = COLS.reduce((sum, c) => sum + c.width, 0);

// Display the jobs assigned or offered to the logged-in provider
export default function Jobs() {
  const { bookings, getUserName, acceptOffer, setStatus } = useApp();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="My Jobs" />

      {/* Show an empty state when there are no bookings */}
      {bookings.length === 0 ? (
        <EmptyState icon="briefcase-outline" title="No jobs yet" text="Customer offers for your service will appear here." />
      ) : (
        // Allow the table to scroll vertically when it has many jobs
        <ScrollView contentContainerStyle={{ padding: 16 }}>

          {/* Allow horizontal scrolling because the table may be wider than the screen */}
          <ScrollView horizontal>
            <View style={{ width: TABLE_WIDTH }}>

              {/* Display the table column headings */}
              <View style={[styles.row, styles.headRow]}>
                {COLS.map((c) => (
                  <Text key={c.label} style={[styles.cell, styles.headText, { width: c.width }]}>{c.label}</Text>
                ))}
              </View>

              {/* Display each booking as a separate table row */}
              {bookings.map((b, i) => {
                const next = providerNextStep[b.status];

                return (
                  <View key={b.id} style={[styles.row, i % 2 === 1 && styles.altRow, !b.providerId && styles.offerRow]}>

                    {/* Show customer, service, price and description */}
                    <View style={[styles.cell, { width: COLS[0].width }]}>
                      <Text style={styles.strong} numberOfLines={1}>{getUserName(b.customerId)}</Text>
                      <Text style={styles.service}>{categoryOf(b.category).name} · Rs {b.price.toLocaleString()}</Text>
                      <Text style={styles.muted} numberOfLines={2}>{b.description}</Text>
                    </View>

                    {/* Show the current booking status or mark it as a new offer */}
                    <View style={[styles.cell, { width: COLS[1].width }]}>
                      {b.providerId ? <StatusBadge status={b.status} /> : <Text style={styles.newTag}>New offer</Text>}
                    </View>

                    {/* Show the booking date and service address */}
                    <View style={[styles.cell, { width: COLS[2].width }]}>
                      <Text style={styles.strong}>{formatDate(b.date)}</Text>
                      <Text style={styles.muted} numberOfLines={2}>{b.address}</Text>
                    </View>

                    {/* Show the action available to the provider */}
                    <View style={[styles.cell, { width: COLS[3].width }]}>
                      {!b.providerId ? (
                        <Button title="Accept" variant="accent" small onPress={() => acceptOffer(b.id)} />
                      ) : next ? (
                        <Button title={next.label} small onPress={() => setStatus(b.id, next.to)} />
                      ) : (
                        <Text style={styles.muted}>-</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </ScrollView>
      )}
    </View>
  );
}

// Define the appearance of table rows, columns and text
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.border },
  headRow: { backgroundColor: colors.primary, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  altRow: { backgroundColor: '#f8fafc' },
  offerRow: { borderLeftWidth: 4, borderLeftColor: colors.accent },
  cell: { paddingHorizontal: 8, paddingVertical: 12, justifyContent: 'center' },
  headText: { color: '#fff', fontWeight: '700', fontSize: 12, textTransform: 'uppercase' },
  strong: { color: colors.text, fontWeight: '700', fontSize: 14 },
  service: { color: colors.accent, fontWeight: '700', fontSize: 12, marginTop: 2 },
  muted: { color: colors.muted, fontSize: 12, marginTop: 2 },
  newTag: { color: colors.accent, fontWeight: '800', fontSize: 12 },
});