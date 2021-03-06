<?php

namespace api\models\product;

use Yii;
use common\models\Favorite as FavoriteModel;
use yii\data\ActiveDataProvider;
use yii\web\HttpException;
use api\models\product\ProductInfo;

class Favorite extends FavoriteModel
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['customer_id', 'product_id'], 'required', 'message' => '{attribute}不能为空'],
            [['customer_id'], 'integer'],
            [['created_at', 'updated_at'], 'safe'],
            [['product_id'], 'integer'],
        ];
    }

    public function fields()
    {
        return [
            'id',
            'product_id',
            'customer_id',
            'product',
        ];
    }

    public function getList()
    {
        $id = Yii::$app->user->identity->id;
        $query = static::find()
            ->where(['customer_id' => $id]);
        $query->with('product');
        $dataProvider = new ActiveDataProvider([
            'query' => $query,
            'sort' => [
                'defaultOrder' => [
                    'created_at' => SORT_DESC,
                ]
            ],
        ]);

        return $dataProvider;   
    }

    public function createFavorite()
    {
        if (! $this->validate()) {
            throw new HttpException(421, array_values($this->getFirstErrors())[0]);
        }

        if (! $this->save()) {
            throw new HttpException(421, array_values($this->getFirstErrors())[0]);
        }

        return $this;
    }

    public function updateFavorite($data)
    {
        $favorite = static::findOne($data['id']);
        if (is_null($favorite)) {
            throw new HttpException(418, '更新失败，查找不到收藏信息');
        }

        $favorite->load($data, '');
        if (! $favorite->validate()) {
            throw new HttpException(423, array_values($favorite->getFirstErrors())[0]);
        }

        if (! $favorite->save()) {
            throw new HttpException(423, array_values($favorite->getFirstErrors())[0]);
        }

        return $favorite;
    }

    public function deleteFavorite($id)
    {
        $favorite = static::findOne($id);
        if (is_null($favorite)) {
            return true;
        }

        return $favorite->delete();
    }

    public function getProduct()
    {
        return $this->hasOne(ProductInfo::className(), ['id' => 'product_id']);
    }
}
