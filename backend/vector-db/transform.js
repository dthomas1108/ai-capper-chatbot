export const transformCapper = (capper) => {
    const searchableText = [
        capper.name,
        capper.nickname,
        capper.bio,
        `Specialties: ${capper.specialties?.join(', ')}`,
        `Experience: ${capper.yearsExperience} years`,
        `Win rate: ${capper.currentStats.winPercentage}%`,
        `Units Profit: ${capper.currentStats.unitsProfit}`,
        capper.achievements.join('. ')
    ].join(' ');

    const metaData = {
        id: capper.id,
        name: capper.name,
        type: 'capper',
        sports: capper.specialties,
        winPercentage: capper.currentStats.winPercentage,
        unitsProfit: capper.currentStats.unitsProfit,
        roi: capper.currentStats.roi,
        yearsExperience: capper.yearsExperience,
        recentRecord: capper.recentPerformance?.last7Days.record,
        recentUnits: parseFloat(handicapper.recentPerformance?.last7Days?.units?.replace('+', '') || '0'),
    };

    return {
        id: capper.id,
        text: searchableText,
        metadata: metaData,
    };
};

export const transformPackage = (pkg) => {
    const searchableText = [
        pkg.title,
        pkg.capperId,
        `Sport: ${pkg.sport}`,
        `Type: ${pkg.type}`,
        `Price: $${pkg.price}`,
        `Confidence: ${pkg.confidence}%`,
        pkg.description,
        `Includes: ${pkg.includes.join(', ')}`,
    ].join(' ');

    const metaData = {
        id: pkg.id,
        capperId: pkg.capperId,
        type: 'package',
        sport: pkg.sport,
        packageType: pkg.type,
        price: pkg.price,
        confidence: pkg.confidence,
        duration: pkg.duration,
    };

    return {
        id: pkg.id,
        text: searchableText,
        metadata: metaData,
    }
}