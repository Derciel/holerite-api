import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Holerite, TIPO_LABELS, TIPO_COLORS, HoleriteTipo } from '../types/holerite';

interface Props {
  holerite: Holerite;
  onPress: () => void;
}

export function HoleriteCard({ holerite, onPress }: Props) {
  const tipo = holerite.tipo as HoleriteTipo;
  const tipoLabel = TIPO_LABELS[tipo] || holerite.tipo;
  const tipoColor = TIPO_COLORS[tipo] || '#888';

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: tipoColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardTop}>
        <View style={[styles.iconBox, { backgroundColor: `${tipoColor}20` }]}>
          <Text style={[styles.icon, { color: tipoColor }]}>
            {tipo === 'SALARIO' ? '💰' : tipo === 'ADIANTAMENTO' ? '🔄' : tipo === 'FERIAS' ? '🏖' : tipo === 'RENDIMENTOS' ? '📋' : '📄'}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{tipoLabel}</Text>
          <Text style={styles.period}>{holerite.mes}/{holerite.ano}</Text>
        </View>
        <View style={[styles.tipoBadge, { backgroundColor: `${tipoColor}20`, borderColor: `${tipoColor}40` }]}>
          <Text style={[styles.tipoBadgeText, { color: tipoColor }]}>
            {tipoLabel}
          </Text>
        </View>
      </View>

      <View style={styles.cardBottom}>
        <View>
          {holerite.tipo !== 'RENDIMENTOS' ? (
            holerite.valor_liquido ? (
              <>
                <Text style={styles.currency}>BRL</Text>
                <Text style={styles.value}>
                  R$ {Number(holerite.valor_liquido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Text>
              </>
            ) : (
              <Text style={styles.valueMuted}>Ver PDF</Text>
            )
          ) : (
            <Text style={styles.valueMuted}>Ver documento</Text>
          )}
        </View>
        <View style={styles.statusTag}>
          <View style={[styles.dot, { backgroundColor: tipoColor }]} />
          <Text style={styles.statusText}>{tipoLabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderLeftWidth: 3,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
  },
  period: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  tipoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 50,
    borderWidth: 1,
  },
  tipoBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  currency: {
    fontSize: 10,
    color: '#666',
    fontWeight: '700',
  },
  value: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFF',
  },
  valueMuted: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 50,
  },
  statusText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '700',
  },
});
